import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { MessagesRepository } from './messages.repository';
import { ConversationsRepository } from '../conversations/conversations.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { Conversation } from '@obrafacil/shared';

describe('MessagesService', () => {
  let service: MessagesService;
  let messagesRepo: jest.Mocked<MessagesRepository>;
  let conversationsRepo: jest.Mocked<ConversationsRepository>;

  const mockClientId = '11111111-1111-4111-a111-111111111111';
  const mockProfessionalId = '22222222-2222-4222-a222-222222222222';
  const mockConversationId = '33333333-3333-4333-a333-333333333333';

  const mockConversation: Conversation = {
    id: mockConversationId,
    client_id: mockClientId,
    professional_id: mockProfessionalId,
    created_at: new Date().toISOString(),
    last_message_at: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: MessagesRepository,
          useValue: {
            findByConversation: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: ConversationsRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    messagesRepo = module.get(MessagesRepository);
    conversationsRepo = module.get(ConversationsRepository);
  });

  describe('findByConversation', () => {
    it('should return messages if user is a participant', async () => {
      conversationsRepo.findById.mockResolvedValue(mockConversation);
      messagesRepo.findByConversation.mockResolvedValue([]);

      const result = await service.findByConversation(
        mockConversationId,
        mockClientId,
      );
      expect(result).toEqual([]);
      expect(messagesRepo.findByConversation).toHaveBeenCalledWith(
        mockConversationId,
        50,
      );
    });

    it('should throw ForbiddenException if user is not a participant', async () => {
      conversationsRepo.findById.mockResolvedValue(mockConversation);
      await expect(
        service.findByConversation(
          mockConversationId,
          '44444444-4444-4111-a444-444444444444',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if conversation does not exist', async () => {
      conversationsRepo.findById.mockResolvedValue(null);
      await expect(
        service.findByConversation(mockConversationId, mockClientId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('send', () => {
    const messageInput = {
      conversationId: mockConversationId,
      content: 'Olá!',
    };

    it('should create a message if user is a participant', async () => {
      conversationsRepo.findById.mockResolvedValue(mockConversation);
      messagesRepo.create.mockResolvedValue({
        id: 'msg-1',
        conversation_id: mockConversationId,
        sender_id: mockClientId,
        type: 'text',
        metadata: null,
        created_at: new Date().toISOString(),
        ...messageInput,
      });

      const result = await service.send(mockClientId, messageInput);
      expect(result.content).toBe('Olá!');
      expect(messagesRepo.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not a participant', async () => {
      conversationsRepo.findById.mockResolvedValue(mockConversation);
      await expect(
        service.send('44444444-4444-4111-a444-444444444444', messageInput),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
