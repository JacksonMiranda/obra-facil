import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../core/guards/clerk-auth.guard';
import { ProfessionalsService } from './professionals.service';
import { ProfessionalsRepository } from './professionals.repository';

@ApiTags('professionals')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('v1/professionals')
export class ProfessionalsController {
  constructor(
    private readonly service: ProfessionalsService,
    private readonly repo: ProfessionalsRepository,
  ) {}

  @Get()
  search(@Query() query: Record<string, string>) {
    return this.service.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.repo.findByIdWithReviews(id);
  }
}
