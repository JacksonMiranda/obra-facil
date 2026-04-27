import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../core/guards/clerk-auth.guard';
import { CurrentAccount } from '../../core/decorators/current-account.decorator';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import { WorksRepository } from '../works/works.repository';
import { ProfessionalsRepository } from '../professionals/professionals.repository';
import { ReviewsRepository } from './reviews.repository';
import { VisitsRepository } from '../visits/visits.repository';
import { CreateReviewSchema, type CreateReviewInput } from '@obrafacil/shared';
import type { AccountContext } from '@obrafacil/shared';

@ApiTags('reviews')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('v1/works')
export class ReviewsController {
  constructor(
    private readonly repo: ReviewsRepository,
    private readonly worksRepo: WorksRepository,
    private readonly professionalsRepo: ProfessionalsRepository,
    private readonly visitsRepo: VisitsRepository,
  ) {}

  /** POST /v1/works/:workId/review — client submits a review for a completed work */
  @Post(':workId/review')
  async createReview(
    @Param('workId') workId: string,
    @Body(new ZodValidationPipe(CreateReviewSchema)) body: CreateReviewInput,
    @CurrentAccount() account: AccountContext,
  ) {
    const work = await this.worksRepo.findById(workId);
    if (!work) throw new NotFoundException('Obra não encontrada');

    // Only the client of this work can submit a review
    if (work.client_id !== account.profile.id) {
      throw new ForbiddenException('Apenas o cliente da obra pode avaliar');
    }

    // Work must be completed
    if (work.status !== 'completed') {
      throw new ConflictException(
        'Apenas obras concluídas podem ser avaliadas',
      );
    }

    // The originating visit must not be cancelled or rejected
    const visitId = (work as unknown as { visit_id?: string }).visit_id;
    if (visitId) {
      const visit = await this.visitsRepo.findById(visitId);
      if (visit && ['cancelled', 'rejected'].includes(visit.status)) {
        throw new ConflictException(
          'Não é possível avaliar uma obra cuja visita foi cancelada ou recusada',
        );
      }
    }

    // Prevent the professional from reviewing their own work
    const myPro = await this.professionalsRepo.findByProfileId(
      account.profile.id,
    );
    if (myPro && myPro.id === work.professional_id) {
      throw new ForbiddenException(
        'O profissional não pode avaliar o próprio serviço',
      );
    }

    // Prevent duplicate reviews
    const existing = await this.repo.findByWorkId(workId);
    if (existing) {
      throw new ConflictException('Esta obra já foi avaliada');
    }

    try {
      return await this.repo.create({
        workId,
        professionalId: work.professional_id,
        reviewerId: account.profile.id,
        rating: body.rating,
        comment: body.comment,
      });
    } catch (err: unknown) {
      // Catch concurrent duplicate from DB unique constraint (work_id, reviewer_id)
      if (
        err instanceof Error &&
        'code' in err &&
        (err as { code: string }).code === '23505'
      ) {
        throw new ConflictException('Esta obra já foi avaliada');
      }
      throw err;
    }
  }

  /** GET /v1/works/:workId/review — get the review for a work (client or professional) */
  @Get(':workId/review')
  async getReview(
    @Param('workId') workId: string,
    @CurrentAccount() account: AccountContext,
  ) {
    const work = await this.worksRepo.findById(workId);
    if (!work) throw new NotFoundException('Obra não encontrada');

    // Only participants of this work can read the review
    const isClient = work.client_id === account.profile.id;
    const myPro = await this.professionalsRepo.findByProfileId(
      account.profile.id,
    );
    const isProfessional = myPro?.id === work.professional_id;

    if (!isClient && !isProfessional) {
      throw new NotFoundException('Obra não encontrada');
    }

    const review = await this.repo.findByWorkId(workId);
    return review ?? null;
  }
}
