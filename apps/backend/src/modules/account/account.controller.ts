import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { ClerkAuthGuard } from '../../core/guards/clerk-auth.guard';
import { CurrentAccount } from '../../core/decorators/current-account.decorator';
import { DatabaseService } from '../../database/database.service';
import {
  ActivateProfessionalSchema,
  UpdateProfileSchema,
  computeCompleteness,
  deriveVisibilityStatus,
} from '@obrafacil/shared';
import type { AccountContext, UserRole } from '@obrafacil/shared';

@ApiTags('account')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('v1/account')
export class AccountController {
  constructor(private readonly db: DatabaseService) {}

  /** Returns the authenticated user's profile + active roles + current actingAs. */
  @Get('me')
  @ApiOperation({ summary: 'Perfil + papéis ativos da conta autenticada' })
  getMe(@CurrentAccount() account: AccountContext) {
    return account;
  }

  /**
   * Activates the professional role for the authenticated account.
   * Creates the professionals record (if not exists) and upserts account_roles.
   * After activation, the user can send X-Acting-As: professional to operate
   * in professional context without creating a new account.
   */
  @Post('roles/professional/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ativar papel de profissional na conta' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['serviceIds', 'bio'],
      properties: {
        serviceIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          minItems: 1,
          example: ['<uuid>'],
        },
        bio: {
          type: 'string',
          example: '10 anos de experiência',
          maxLength: 500,
        },
        city: { type: 'string', example: 'São Paulo', maxLength: 100 },
      },
    },
  })
  async activateProfessionalRole(
    @CurrentAccount() account: AccountContext,
    @Body() body: unknown,
  ) {
    const input = ActivateProfessionalSchema.parse(body);

    const profileId = account.profile.id;

    // 1. Atomically upsert the professionals record.
    // specialty is preserved as a legacy snapshot (first selected service name).
    const { rows: upserted } = await this.db.query<{ id: string }>(
      `INSERT INTO professionals (profile_id, specialty, bio, city)
       VALUES ($1, '', $2, $3)
       ON CONFLICT (profile_id) DO UPDATE
         SET bio  = COALESCE(EXCLUDED.bio, professionals.bio),
             city = COALESCE(EXCLUDED.city, professionals.city)
       RETURNING id`,
      [profileId, input.bio ?? null, input.city ?? null],
    );
    const professionalId = upserted[0].id;

    // 2. Sync professional_services: upsert selected as active, deactivate rest.
    await this.db.query(
      `UPDATE professional_services
          SET visibility_status = 'inactive', updated_at = now()
        WHERE professional_id = $1
          AND service_id != ALL($2::uuid[])
          AND visibility_status = 'active'`,
      [professionalId, input.serviceIds],
    );
    for (const serviceId of input.serviceIds) {
      await this.db.query(
        `INSERT INTO professional_services (professional_id, service_id, visibility_status)
         VALUES ($1, $2, 'active')
         ON CONFLICT (professional_id, service_id)
           DO UPDATE SET visibility_status = 'active', updated_at = now()`,
        [professionalId, serviceId],
      );
    }

    // 3. Update specialty snapshot from first selected service name.
    await this.db.query(
      `UPDATE professionals p
          SET specialty = s.name
         FROM services s
        WHERE s.id = $1
          AND p.id = $2`,
      [input.serviceIds[0], professionalId],
    );

    // 4. Upsert account_roles entry for professional role.
    await this.db.query(
      `INSERT INTO account_roles (profile_id, role, is_active, is_primary)
       VALUES ($1, 'professional', true, false)
       ON CONFLICT (profile_id, role) DO UPDATE SET is_active = true`,
      [profileId],
    );

    // 5. Recompute visibility_status.
    const { rows: proRow } = await this.db.query<{
      bio: string | null;
      full_name: string;
      active_service_count: string;
    }>(
      `SELECT p.bio, pr.full_name,
              (SELECT count(*)::int FROM professional_services ps
                WHERE ps.professional_id = p.id
                  AND ps.visibility_status = 'active') AS active_service_count
         FROM professionals p
         INNER JOIN profiles pr ON pr.id = p.profile_id
        WHERE p.id = $1`,
      [professionalId],
    );
    const completeness = computeCompleteness({
      activeServiceCount: Number(proRow[0]?.active_service_count ?? 0),
      bio: proRow[0]?.bio ?? null,
      full_name: proRow[0]?.full_name ?? null,
    });
    const visibilityStatus = deriveVisibilityStatus(completeness);

    await this.db.query(
      `UPDATE professionals SET visibility_status = $2${visibilityStatus === 'active' ? ', published_at = now()' : ''}
       WHERE id = $1`,
      [professionalId, visibilityStatus],
    );

    // 6. Auto-switch the profile's active role to 'professional'.
    await this.db.query(
      `UPDATE profiles SET role = 'professional', updated_at = now() WHERE id = $1`,
      [profileId],
    );

    const { rows: roles } = await this.db.query<{ role: UserRole }>(
      `SELECT role FROM account_roles WHERE profile_id = $1 AND is_active = true`,
      [profileId],
    );

    return {
      professionalId,
      roles: roles.map((r) => r.role),
      visibility_status: visibilityStatus,
      is_complete: completeness.complete,
      missing_fields: completeness.missing,
      message:
        visibilityStatus === 'active'
          ? 'Perfil profissional ativado com sucesso'
          : 'Perfil salvo como rascunho. Complete os dados para aparecer na listagem.',
    };
  }

  /**
   * Deactivates a role from the account.
   * Cannot deactivate the primary role.
   */
  @Post('roles/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desativar um papel da conta' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['role'],
      properties: {
        role: {
          type: 'string',
          enum: ['client', 'professional', 'store'],
          example: 'professional',
        },
      },
    },
  })
  async deactivateRole(
    @CurrentAccount() account: AccountContext,
    @Body() body: unknown,
  ) {
    const input = z
      .object({ role: z.enum(['client', 'professional', 'store']) })
      .parse(body);

    const profileId = account.profile.id;

    const { rows } = await this.db.query<{ is_primary: boolean }>(
      `SELECT is_primary FROM account_roles WHERE profile_id = $1 AND role = $2`,
      [profileId, input.role],
    );

    if (!rows.length) {
      throw new ConflictException('Papel não encontrado nesta conta');
    }

    if (rows[0].is_primary) {
      throw new ConflictException('Não é possível desativar o papel primário');
    }

    await this.db.query(
      `UPDATE account_roles SET is_active = false WHERE profile_id = $1 AND role = $2`,
      [profileId, input.role],
    );

    // When deactivating the professional role, also hide from public listings
    if (input.role === 'professional') {
      await this.db.query(
        `UPDATE professionals SET visibility_status = 'inactive' WHERE profile_id = $1`,
        [profileId],
      );
    }

    const { rows: updated } = await this.db.query<{ role: UserRole }>(
      `SELECT role FROM account_roles WHERE profile_id = $1 AND is_active = true`,
      [profileId],
    );

    // If profiles.role matches the deactivated role, reset it to the primary
    // active role (or 'client' as safe default) so the bypass guard and
    // actingAs fallback are consistent after deactivation.
    const fallbackRole: UserRole =
      updated.find((r) => r.role === 'client')?.role ??
      updated[0]?.role ??
      'client';
    await this.db.query(
      `UPDATE profiles SET role = $1, updated_at = now()
         WHERE id = $2 AND role = $3`,
      [fallbackRole, profileId, input.role],
    );

    return { roles: updated.map((r) => r.role) };
  }

  /**
   * Persists the preferred acting-as role for the account.
   * Updates profiles.role and sets the cookie value on the client side.
   */
  @Patch('acting-as')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Persistir papel ativo da conta' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['role'],
      properties: {
        role: { type: 'string', enum: ['client', 'professional', 'store'] },
      },
    },
  })
  async setActingAs(
    @CurrentAccount() account: AccountContext,
    @Body() body: unknown,
  ) {
    const input = z
      .object({ role: z.enum(['client', 'professional', 'store']) })
      .parse(body);

    if (!account.roles.includes(input.role)) {
      throw new BadRequestException('Papel não disponível para esta conta');
    }

    await this.db.query(
      `UPDATE profiles SET role = $1, updated_at = now() WHERE id = $2`,
      [input.role, account.profile.id],
    );

    return { actingAs: input.role };
  }

  /**
   * Updates editable profile data for the authenticated account.
   * If the user has a professional profile, recomputes visibility_status
   * because full_name is part of the completeness check.
   */
  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar dados básicos do perfil do usuário' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        full_name: { type: 'string', example: 'João da Silva', maxLength: 100 },
        phone: { type: 'string', example: '(11) 99999-9999', maxLength: 20 },
        avatar_id: {
          type: 'string',
          nullable: true,
          example: 'professional-electrician-01',
          description: 'ID do avatar preset selecionado na galeria',
        },
      },
    },
  })
  async updateProfile(
    @CurrentAccount() account: AccountContext,
    @Body() body: unknown,
  ) {
    const input = UpdateProfileSchema.parse(body);
    const profileId = account.profile.id;

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.full_name !== undefined) {
      // Reject placeholder names
      const trimmed = input.full_name.trim();
      if (!trimmed) throw new BadRequestException('Nome não pode ser vazio');
      setClauses.push(`full_name = $${idx++}`);
      values.push(trimmed);
    }

    if (input.phone !== undefined) {
      setClauses.push(`phone = $${idx++}`);
      values.push(input.phone.trim() || null);
    }

    if (input.avatar_id !== undefined) {
      setClauses.push(`avatar_id = $${idx++}`);
      values.push(input.avatar_id);
    }

    if (!setClauses.length) {
      throw new BadRequestException('Nenhum campo para atualizar');
    }

    setClauses.push(`updated_at = now()`);
    values.push(profileId);

    const { rows } = await this.db.query<{
      id: string;
      full_name: string;
      phone: string | null;
      avatar_url: string | null;
      avatar_id: string | null;
    }>(
      `UPDATE profiles SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING id, full_name, phone, avatar_url, avatar_id`,
      values,
    );

    // If the user has a professional profile, recompute visibility because
    // full_name is part of the completeness check.
    if (
      input.full_name !== undefined &&
      account.roles.includes('professional')
    ) {
      const { rows: proRows } = await this.db.query<{
        id: string;
        bio: string | null;
        active_service_count: string;
      }>(
        `SELECT p.id, p.bio,
           (SELECT COUNT(*) FROM professional_services ps WHERE ps.professional_id = p.id AND ps.visibility_status = 'active')::text AS active_service_count
         FROM professionals p WHERE p.profile_id = $1`,
        [profileId],
      );
      if (proRows.length) {
        const pro = proRows[0];
        const completeness = computeCompleteness({
          activeServiceCount: parseInt(pro.active_service_count, 10),
          bio: pro.bio,
          full_name: input.full_name.trim(),
        });
        const visibilityStatus = deriveVisibilityStatus(completeness);
        await this.db.query(
          `UPDATE professionals
              SET visibility_status = $2${visibilityStatus === 'active' ? ', published_at = COALESCE(published_at, now())' : ''}
            WHERE id = $1`,
          [pro.id, visibilityStatus],
        );
      }
    }

    return rows[0];
  }
}
