import {
  Body,
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
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { MaterialListsService } from './material-lists.service';
import { StoreOffersRepository } from './store-offers.repository';
import type { Profile } from '@obrafacil/shared';

@ApiTags('material-lists')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('v1/material-lists')
export class MaterialListsController {
  constructor(
    private readonly service: MaterialListsService,
    private readonly storeOffersRepo: StoreOffersRepository,
  ) {}

  @Get()
  findAll(@CurrentUser() profile: Profile) {
    if (profile.role !== 'professional') {
      throw new ForbiddenException('Apenas profissionais têm listas de materiais');
    }
    return this.service.findAllByProfessional(profile.id);
  }

  @Get(':id')
  async findOne(@CurrentUser() _profile: Profile, @Param('id') id: string) {
    const list = await this.service.findById(id);
    if (!list) throw new NotFoundException('Lista não encontrada');
    return list;
  }

  @Get(':id/offers')
  getOffers(@Param('id') id: string) {
    return this.storeOffersRepo.findByList(id);
  }

  @Post()
  create(@CurrentUser() profile: Profile, @Body() body: unknown) {
    if (profile.role !== 'professional') {
      throw new ForbiddenException('Apenas profissionais podem criar listas de materiais');
    }
    return this.service.create(profile.id, body);
  }

  @Post(':id/items')
  addItem(
    @Param('id') listId: string,
    @CurrentUser() profile: Profile,
    @Body() body: unknown,
  ) {
    if (profile.role !== 'professional') {
      throw new ForbiddenException('Apenas profissionais podem adicionar itens');
    }
    return this.service.addItem(profile.id, listId, body);
  }
}
