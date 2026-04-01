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
import { ConversationsRepository } from './conversations.repository';
import { OpenConversationSchema } from '@obrafacil/shared';
import type { Profile } from '@obrafacil/shared';

@ApiTags('conversations')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('v1/conversations')
export class ConversationsController {
  constructor(private readonly repo: ConversationsRepository) {}

  @Get()
  findAll(@CurrentUser() profile: Profile) {
    return this.repo.findAllByProfile(profile.id);
  }

  @Get(':id')
  async findOne(@CurrentUser() profile: Profile, @Param('id') id: string) {
    const conversation = await this.repo.findById(id);
    if (!conversation) throw new NotFoundException('Conversa não encontrada');
    if (
      conversation.client_id !== profile.id &&
      conversation.professional_id !== profile.id
    ) {
      throw new ForbiddenException('Acesso negado');
    }
    return conversation;
  }

  @Post()
  async create(@CurrentUser() profile: Profile, @Body() body: unknown) {
    if (profile.role !== 'client') {
      throw new ForbiddenException('Apenas clientes podem iniciar conversas');
    }
    const { professionalProfileId } = OpenConversationSchema.parse(body);
    return this.repo.findOrCreate({
      clientId: profile.id,
      professionalId: professionalProfileId,
    });
  }
}
