import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../core/guards/clerk-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { WorksRepository } from './works.repository';
import type { Profile } from '@obrafacil/shared';

@ApiTags('works')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('v1/works')
export class WorksController {
  constructor(private readonly repo: WorksRepository) {}

  @Get()
  findAll(@CurrentUser() profile: Profile) {
    return profile.role === 'professional'
      ? this.repo.findAllByProfessional(profile.id)
      : this.repo.findAllByClient(profile.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const work = await this.repo.findById(id);
    if (!work) throw new NotFoundException('Obra não encontrada');
    return work;
  }

  @Patch(':id/progress')
  updateProgress(
    @Param('id') id: string,
    @Body() body: { progressPct: number },
  ) {
    return this.repo.updateProgress(id, Number(body.progressPct));
  }
}
