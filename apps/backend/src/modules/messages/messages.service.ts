import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { MessagesRepository } from './messages.repository';
import { ConversationsRepository } from '../conversations/conversations.repository';
import { SendMessageSchema } from '@obrafacil/shared';
import type { Message, MessageWithSender } from '@obrafacil/shared';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepo: MessagesRepository,
    private readonly conversationsRepo: ConversationsRepository,
  ) {}

  async findByConversation(
    conversationId: string,
    profileId: string,
    limit = 50,
  ): Promise<MessageWithSender[]> {
    const conversation = await this.conversationsRepo.findById(conversationId);
    if (!conversation) throw new NotFoundException('Conversa não encontrada');
    if (
      conversation.client_id !== profileId &&
      conversation.professional_id !== profileId
    ) {
      throw new ForbiddenException('Acesso negado');
    }
    return this.messagesRepo.findByConversation(conversationId, limit);
  }

  async send(senderId: string, rawInput: unknown): Promise<Message> {
    const input = SendMessageSchema.parse(rawInput);

    const conversation = await this.conversationsRepo.findById(
      input.conversationId,
    );
    if (!conversation) throw new NotFoundException('Conversa não encontrada');
    if (
      conversation.client_id !== senderId &&
      conversation.professional_id !== senderId
    ) {
      throw new ForbiddenException(
        'Acesso negado: você não faz parte desta conversa',
      );
    }

    return this.messagesRepo.create({
      conversationId: input.conversationId,
      senderId,
      content: input.content,
    });
  }
}
