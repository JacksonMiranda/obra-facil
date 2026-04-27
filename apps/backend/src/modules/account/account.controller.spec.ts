import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { AccountController } from './account.controller';
import { DatabaseService } from '../../database/database.service';
import { ClerkAuthGuard } from '../../core/guards/clerk-auth.guard';
import type { AccountContext, Profile } from '@obrafacil/shared';

describe('AccountController', () => {
  let controller: AccountController;
  let db: jest.Mocked<Pick<DatabaseService, 'query'>>;

  const mockProfile: Profile = {
    id: 'profile-uuid',
    clerk_id: 'clerk-001',
    full_name: 'Jackson Miranda',
    avatar_url: null,
    avatar_id: null,
    phone: null,
    role: 'client',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockClientAccount: AccountContext = {
    profile: mockProfile,
    roles: ['client'],
    actingAs: 'client',
  };

  const mockProfessionalAccount: AccountContext = {
    profile: { ...mockProfile, role: 'professional' },
    roles: ['client', 'professional'],
    actingAs: 'professional',
  };

  beforeEach(async () => {
    const dbMock = { query: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [{ provide: DatabaseService, useValue: dbMock }],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AccountController>(AccountController);
    db = module.get(DatabaseService);
  });

  // ── getMe ─────────────────────────────────────────────────────────────────

  describe('getMe', () => {
    it('should return the account context as-is', () => {
      const result = controller.getMe(mockClientAccount);
      expect(result).toEqual(mockClientAccount);
    });
  });

  // ── activateProfessionalRole ───────────────────────────────────────────────

  describe('activateProfessionalRole', () => {
    const validBody = {
      serviceIds: ['a1b2c3d4-e5f6-4789-8000-000000000001'],
      bio: 'Mais de 10 anos de experiência em marcenaria',
    };

    it('creates a new professionals record when none exists', async () => {
      (db.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ id: 'pro-uuid' }] }) // UPSERT professionals
        .mockResolvedValueOnce({ rows: [] }) // UPDATE ps inactive
        .mockResolvedValueOnce({ rows: [] }) // UPSERT professional_services
        .mockResolvedValueOnce({ rows: [] }) // UPDATE specialty snapshot
        .mockResolvedValueOnce({ rows: [] }) // UPSERT account_roles
        .mockResolvedValueOnce({
          rows: [
            {
              bio: validBody.bio,
              full_name: mockProfile.full_name,
              active_service_count: '1',
            },
          ],
        }) // SELECT bio + full_name + count
        .mockResolvedValueOnce({ rows: [] }) // UPDATE visibility_status
        .mockResolvedValueOnce({ rows: [] }) // UPDATE profiles role
        .mockResolvedValueOnce({
          rows: [{ role: 'client' }, { role: 'professional' }],
        }); // SELECT roles

      const result = await controller.activateProfessionalRole(
        mockClientAccount,
        validBody,
      );

      expect(result.professionalId).toBe('pro-uuid');
      expect(result.visibility_status).toBe('active');
      expect(result.is_complete).toBe(true);
      expect(result.roles).toContain('professional');

      // Verify idempotent upsert is used — must contain ON CONFLICT
      const upsertCall = (db.query as jest.Mock).mock.calls[0] as unknown[];
      expect((upsertCall[0] as string).toUpperCase()).toContain('ON CONFLICT');
    });

    it('reuses the existing professionals record on re-activation', async () => {
      (db.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ id: 'existing-pro-uuid' }] }) // UPSERT professionals
        .mockResolvedValueOnce({ rows: [] }) // UPDATE ps inactive
        .mockResolvedValueOnce({ rows: [] }) // UPSERT professional_services
        .mockResolvedValueOnce({ rows: [] }) // UPDATE specialty snapshot
        .mockResolvedValueOnce({ rows: [] }) // UPSERT account_roles
        .mockResolvedValueOnce({
          rows: [
            {
              bio: validBody.bio,
              full_name: mockProfile.full_name,
              active_service_count: '1',
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] }) // UPDATE visibility_status
        .mockResolvedValueOnce({ rows: [] }) // UPDATE profiles role
        .mockResolvedValueOnce({
          rows: [{ role: 'client' }, { role: 'professional' }],
        });

      const result = await controller.activateProfessionalRole(
        mockClientAccount,
        validBody,
      );

      expect(result.professionalId).toBe('existing-pro-uuid');

      // Verify the single upsert query is used for both create and re-activate paths
      expect(db.query).toHaveBeenCalledTimes(9);
      const upsertCall = (db.query as jest.Mock).mock.calls[0] as unknown[];
      expect((upsertCall[0] as string).toUpperCase()).toContain('ON CONFLICT');
    });

    it('returns draft status when bio is too short', async () => {
      const bodyShortBio = {
        serviceIds: ['a1b2c3d4-e5f6-4789-8000-000000000001'],
        bio: 'curto',
      };

      await expect(
        controller.activateProfessionalRole(mockClientAccount, bodyShortBio),
      ).rejects.toThrow(); // Zod validation: bio must be >= MIN_BIO_LENGTH
    });

    it('throws Zod error when serviceIds is missing', async () => {
      await expect(
        controller.activateProfessionalRole(mockClientAccount, {
          bio: 'Some bio text here that is long enough',
        }),
      ).rejects.toThrow();
    });
  });

  // ── deactivateRole ────────────────────────────────────────────────────────

  describe('deactivateRole', () => {
    it('deactivates professional role without clearing bio or specialty', async () => {
      (db.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ is_primary: false }] }) // SELECT is_primary
        .mockResolvedValueOnce({ rows: [] }) // UPDATE account_roles is_active=false
        .mockResolvedValueOnce({ rows: [] }) // UPDATE professionals visibility_status='inactive'
        .mockResolvedValueOnce({ rows: [{ role: 'client' }] }) // SELECT remaining roles
        .mockResolvedValueOnce({ rows: [] }); // UPDATE profiles SET role = fallback

      const result = await controller.deactivateRole(mockProfessionalAccount, {
        role: 'professional',
      });

      expect(result.roles).toEqual(['client']);

      // Verify visibility_status is set to inactive
      const allCalls: unknown[][] = (db.query as jest.Mock).mock
        .calls as unknown[][];
      const visibilityUpdate: unknown[] | undefined = allCalls.find((call) =>
        (call[0] as string).includes("visibility_status = 'inactive'"),
      );
      expect(visibilityUpdate).toBeDefined();

      // Verify that NO DELETE or UPDATE clearing bio/specialty was called
      const destructiveCalls: unknown[][] = allCalls.filter((call) => {
        const sql = call[0] as string;
        return sql.includes('bio = null') || sql.includes('specialty = null');
      });
      expect(destructiveCalls).toHaveLength(0);
    });

    it('throws ConflictException when trying to deactivate the primary role', async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ is_primary: true }],
      });

      await expect(
        controller.deactivateRole(mockClientAccount, { role: 'client' }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException when role does not exist for account', async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await expect(
        controller.deactivateRole(mockClientAccount, { role: 'professional' }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws Zod error for unknown role', async () => {
      await expect(
        controller.deactivateRole(mockClientAccount, { role: 'admin' }),
      ).rejects.toThrow();
    });
  });

  // ── setActingAs ───────────────────────────────────────────────────────────

  describe('setActingAs', () => {
    it('updates profiles.role without touching professionals or account_roles', async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // UPDATE profiles

      const result = await controller.setActingAs(mockProfessionalAccount, {
        role: 'client',
      });

      expect(result).toEqual({ actingAs: 'client' });

      // Only one query should have been made
      expect(db.query).toHaveBeenCalledTimes(1);

      // That query must be a profiles UPDATE, not touching professionals
      const sql = (
        (db.query as jest.Mock).mock.calls[0] as unknown[]
      )[0] as string;
      expect(sql).toContain('UPDATE profiles');
      expect(sql).not.toContain('professionals');
      expect(sql).not.toContain('account_roles');
    });

    it('throws BadRequestException when switching to a role the account does not have', async () => {
      await expect(
        controller.setActingAs(mockClientAccount, { role: 'professional' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws Zod error for invalid role value', async () => {
      await expect(
        controller.setActingAs(mockClientAccount, { role: 'superadmin' }),
      ).rejects.toThrow();
    });
  });

  // ── Data preservation after deactivate → reactivate ──────────────────────

  describe('deactivate then reactivate preserves professional data', () => {
    it('re-activation reuses existing professional record', async () => {
      const bio = 'Marceneiro com 10 anos de experiência em reformas.';
      const serviceId = 'a1b2c3d4-e5f6-4789-8000-000000000001';

      // ── deactivate ──
      (db.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ is_primary: false }] }) // is_primary check
        .mockResolvedValueOnce({ rows: [] }) // set is_active=false
        .mockResolvedValueOnce({ rows: [] }) // set visibility_status=inactive
        .mockResolvedValueOnce({ rows: [{ role: 'client' }] }) // remaining roles
        .mockResolvedValueOnce({ rows: [] }); // UPDATE profiles SET role = fallback

      await controller.deactivateRole(mockProfessionalAccount, {
        role: 'professional',
      });
      expect(db.query).toHaveBeenCalledTimes(5);

      (db.query as jest.Mock).mockClear();

      // ── reactivate ──
      (db.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ id: 'existing-pro-uuid' }] }) // UPSERT professionals
        .mockResolvedValueOnce({ rows: [] }) // UPDATE ps inactive
        .mockResolvedValueOnce({ rows: [] }) // UPSERT professional_services
        .mockResolvedValueOnce({ rows: [] }) // UPDATE specialty snapshot
        .mockResolvedValueOnce({ rows: [] }) // UPSERT account_roles
        .mockResolvedValueOnce({
          rows: [
            {
              bio,
              full_name: mockProfile.full_name,
              active_service_count: '1',
            },
          ],
        }) // SELECT bio + full_name + count
        .mockResolvedValueOnce({ rows: [] }) // update visibility_status
        .mockResolvedValueOnce({ rows: [] }) // UPDATE profiles SET role
        .mockResolvedValueOnce({
          rows: [{ role: 'client' }, { role: 'professional' }],
        });

      const result = await controller.activateProfessionalRole(
        mockClientAccount,
        {
          serviceIds: [serviceId],
          bio,
        },
      );

      // Exactly 9 queries
      expect(db.query).toHaveBeenCalledTimes(9);

      // Upsert uses ON CONFLICT — guarantees idempotency
      const upsertCall = (db.query as jest.Mock).mock.calls[0] as unknown[];
      expect((upsertCall[0] as string).toUpperCase()).toContain('ON CONFLICT');

      expect(result.professionalId).toBe('existing-pro-uuid');
      expect(result.visibility_status).toBe('active');
    });
  });
});
