import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type {
  IMessagesRepository,
  Message,
  MessageWithSender,
} from '@obrafacil/shared';

@Injectable()
export class MessagesRepository implements IMessagesRepository {
  constructor(private readonly db: DatabaseService) {}

  async findByConversation(
    conversationId: string,
    limit = 50,
  ): Promise<MessageWithSender[]> {
    const { rows } = await this.db.query(
      `SELECT
         m.id, m.conversation_id, m.sender_id, m.content, m.type, m.metadata, m.created_at,
         json_build_object(
           'id', p.id, 'full_name', p.full_name, 'avatar_url', p.avatar_url
         ) AS profiles
       FROM messages m
       INNER JOIN profiles p ON p.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC
       LIMIT $2`,
      [conversationId, limit],
    );
    return rows as unknown as MessageWithSender[];
  }

  async create({
    conversationId,
    senderId,
    content,
    metadata,
  }: {
    conversationId: string;
    senderId: string;
    content: string;
    metadata?: Record<string, unknown>;
  }): Promise<Message> {
    await this.db.query(
      `UPDATE conversations SET last_message_at = now() WHERE id = $1`,
      [conversationId],
    );
    const { rows } = await this.db.query(
      `INSERT INTO messages (conversation_id, sender_id, content, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [conversationId, senderId, content, JSON.stringify(metadata ?? {})],
    );
    return rows[0] as unknown as Message;
  }
}
