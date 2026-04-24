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
import { CurrentAccount } from '../../core/decorators/current-account.decorator';
import { MaterialListsService } from './material-lists.service';
import { StoreOffersRepository } from './store-offers.repository';
import { ProfessionalsRepository } from '../professionals/professionals.repository';
import type { AccountContext } from '@obrafacil/shared';

@ApiTags('material-lists')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('v1/material-lists')
export class MaterialListsController {
  constructor(
    private readonly service: MaterialListsService,
    private readonly storeOffersRepo: StoreOffersRepository,
    private readonly professionalsRepo: ProfessionalsRepository,
  ) {}

  @Get()
  async findAll(@CurrentAccount() account: AccountContext) {
    if (account.actingAs !== 'professional') {
      throw new ForbiddenException(
        'Apenas profissionais têm listas de materiais',
      );
    }
    const professional = await this.professionalsRepo.findByProfileId(
      account.profile.id,
    );
    if (!professional)
      throw new NotFoundException('Profissional não encontrado');
    return this.service.findAllByProfessional(professional.id);
  }

  @Get(':id')
  async findOne(
    @CurrentAccount() account: AccountContext,
    @Param('id') id: string,
  ) {
    const professional = await this.professionalsRepo.findByProfileId(
      account.profile.id,
    );
    if (!professional) throw new NotFoundException('Lista não encontrada');
    return this.service.findById(id, professional.id);
  }

  @Get(':id/offers')
  async getOffers(
    @CurrentAccount() account: AccountContext,
    @Param('id') id: string,
  ) {
    // Validate ownership before returning offers
    const professional = await this.professionalsRepo.findByProfileId(
      account.profile.id,
    );
    if (!professional) throw new NotFoundException('Lista não encontrada');
    await this.service.findById(id, professional.id);
    return this.storeOffersRepo.findByList(id);
  }

  @Post()
  async create(
    @CurrentAccount() account: AccountContext,
    @Body() body: unknown,
  ) {
    if (account.actingAs !== 'professional') {
      throw new ForbiddenException(
        'Apenas profissionais podem criar listas de materiais',
      );
    }
    const professional = await this.professionalsRepo.findByProfileId(
      account.profile.id,
    );
    if (!professional)
      throw new NotFoundException('Profissional não encontrado');
    return this.service.create(professional.id, body);
  }

  @Post(':id/items')
  async addItem(
    @Param('id') listId: string,
    @CurrentAccount() account: AccountContext,
    @Body() body: unknown,
  ) {
    if (account.actingAs !== 'professional') {
      throw new ForbiddenException(
        'Apenas profissionais podem adicionar itens',
      );
    }
    const professional = await this.professionalsRepo.findByProfileId(
      account.profile.id,
    );
    if (!professional)
      throw new NotFoundException('Profissional não encontrado');
    return this.service.addItem(professional.id, listId, body);
  }
}
