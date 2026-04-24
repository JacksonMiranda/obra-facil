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
import { ConversationsRepository } from './conversations.repository';
import { ProfessionalsRepository } from '../professionals/professionals.repository';
import { OpenConversationSchema } from '@obrafacil/shared';
import type { AccountContext } from '@obrafacil/shared';

@ApiTags('conversations')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('v1/conversations')
export class ConversationsController {
  constructor(
    private readonly repo: ConversationsRepository,
    private readonly professionalsRepo: ProfessionalsRepository,
  ) {}

  @Get()
  findAll(@CurrentAccount() account: AccountContext) {
    return this.repo.findAllByProfile(account.profile.id);
  }

  @Get(':id')
  async findOne(
    @CurrentAccount() account: AccountContext,
    @Param('id') id: string,
  ) {
    const conversation = await this.repo.findById(id);
    if (!conversation) throw new NotFoundException('Conversa não encontrada');
    const conv = conversation as unknown as Record<string, unknown> &
      typeof conversation;
    if (
      conversation.client_id !== account.profile.id &&
      (conv.professional as Record<string, unknown> | undefined)?.id !==
        account.profile.id
    ) {
      throw new ForbiddenException('Acesso negado');
    }
    return conversation;
  }

  @Post()
  async create(
    @CurrentAccount() account: AccountContext,
    @Body() body: unknown,
  ) {
    if (account.actingAs !== 'client') {
      throw new ForbiddenException('Apenas clientes podem iniciar conversas');
    }
    const { professionalProfileId } = OpenConversationSchema.parse(body);
    const professional = await this.professionalsRepo.findByProfileId(
      professionalProfileId,
    );
    if (!professional)
      throw new NotFoundException('Profissional não encontrado');
    return this.repo.findOrCreate({
      clientId: account.profile.id,
      professionalId: professional.id,
    });
  }
}
