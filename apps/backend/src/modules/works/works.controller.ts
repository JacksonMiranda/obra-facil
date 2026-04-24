import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../core/guards/clerk-auth.guard';
import { CurrentAccount } from '../../core/decorators/current-account.decorator';
import { OwnershipService } from '../../core/authorization/ownership.service';
import { WorksRepository } from './works.repository';
import { ProfessionalsRepository } from '../professionals/professionals.repository';
import { NotificationsService } from '../notifications/notifications.service';
import type { AccountContext } from '@obrafacil/shared';

@ApiTags('works')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('v1/works')
export class WorksController {
  constructor(
    private readonly repo: WorksRepository,
    private readonly professionalsRepo: ProfessionalsRepository,
    private readonly ownershipService: OwnershipService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  async findAll(@CurrentAccount() account: AccountContext) {
    if (account.actingAs === 'professional') {
      const pro = await this.professionalsRepo.findByProfileId(
        account.profile.id,
      );
      if (!pro) return [];
      return this.repo.findAllByProfessional(pro.id);
    }
    return this.repo.findAllByClient(account.profile.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentAccount() account: AccountContext,
  ) {
    const work = await this.repo.findById(id);
    // Return 404 for both "not found" and "not authorized" to avoid leaking existence
    if (!work) throw new NotFoundException('Obra não encontrada');
    if (!this.ownershipService.canReadWork(account.profile.id, work)) {
      throw new NotFoundException('Obra não encontrada');
    }
    return work;
  }

  @Patch(':id/progress')
  async updateProgress(
    @Param('id') id: string,
    @CurrentAccount() account: AccountContext,
    @Body() body: { progressPct?: number },
  ) {
    const pct = Number(body.progressPct);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      throw new BadRequestException('progressPct deve ser entre 0 e 100');
    }
    const work = await this.assertIsWorksProfessional(id, account);
    const result = await this.repo.updateProgress(id, pct);
    await this.notificationsService.notify({
      profileId: work.client_id,
      type: 'work_progress',
      title: 'Progresso da obra atualizado',
      message: `O profissional atualizou o progresso da obra para ${pct}%.`,
      link: `/meus-servicos/${id}`,
    });
    return result;
  }

  @Patch(':id/start')
  async start(
    @Param('id') id: string,
    @CurrentAccount() account: AccountContext,
  ) {
    const work = await this.assertIsWorksProfessional(id, account);
    if (work.status !== 'scheduled') {
      throw new ConflictException('Apenas obras agendadas podem ser iniciadas');
    }
    const result = await this.repo.updateStatus(id, 'active');
    await this.notificationsService.notify({
      profileId: work.client_id,
      type: 'work_started',
      title: 'Obra iniciada!',
      message: `O profissional iniciou a obra "${work.title}".`,
      link: `/meus-servicos/${id}`,
    });
    return result;
  }

  @Patch(':id/complete')
  async complete(
    @Param('id') id: string,
    @CurrentAccount() account: AccountContext,
  ) {
    const work = await this.assertIsWorksProfessional(id, account);
    if (work.status !== 'active') {
      throw new ConflictException(
        'Apenas obras ativas podem ser marcadas como concluídas',
      );
    }
    const result = await this.repo.updateStatus(id, 'completed');
    await this.notificationsService.notify({
      profileId: work.client_id,
      type: 'work_completed',
      title: 'Obra concluída!',
      message: `O profissional concluiu a obra "${work.title}".`,
      link: `/meus-servicos/${id}`,
    });
    return result;
  }

  private async assertIsWorksProfessional(
    workId: string,
    account: AccountContext,
  ) {
    const work = await this.repo.findById(workId);
    if (!work) throw new NotFoundException('Obra não encontrada');
    if (account.actingAs !== 'professional') {
      throw new ForbiddenException(
        'Apenas o profissional responsável pode alterar a obra',
      );
    }
    const pro = await this.professionalsRepo.findByProfileId(
      account.profile.id,
    );
    if (!pro || pro.id !== work.professional_id) {
      throw new ForbiddenException('Esta obra pertence a outro profissional');
    }
    return work;
  }
}
