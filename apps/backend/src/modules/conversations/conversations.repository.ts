import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { IConversationsRepository, Conversation } from '@obrafacil/shared';

@Injectable()
export class ConversationsRepository implements IConversationsRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAllByProfile(profileId: string): Promise<Conversation[]> {
    const { rows } = await this.db.query(
      `SELECT
         c.id, c.client_id, c.professional_id, c.created_at, c.last_message_at,
         json_build_object(
           'id', pp.id, 'full_name', pp.full_name, 'avatar_url', pp.avatar_url,
           'role', pp.role, 'clerk_id', pp.clerk_id
         ) AS professional
       FROM conversations c
       INNER JOIN professionals prof ON prof.id = c.professional_id
       INNER JOIN profiles pp ON pp.id = prof.profile_id
       WHERE c.client_id = $1 OR c.professional_id = $1
       ORDER BY c.last_message_at DESC`,
      [profileId],
    );
    return rows as unknown as Conversation[];
  }

  async findById(id: string): Promise<Conversation | null> {
    const { rows } = await this.db.query(
      `SELECT
         c.id, c.client_id, c.professional_id, c.created_at, c.last_message_at,
         json_build_object(
           'id', cp.id, 'full_name', cp.full_name, 'avatar_url', cp.avatar_url,
           'role', cp.role, 'clerk_id', cp.clerk_id
         ) AS client,
         json_build_object(
           'id', pp.id, 'full_name', pp.full_name, 'avatar_url', pp.avatar_url,
           'role', pp.role, 'clerk_id', pp.clerk_id
         ) AS professional
       FROM conversations c
       INNER JOIN profiles cp ON cp.id = c.client_id
       INNER JOIN professionals prof ON prof.id = c.professional_id
       INNER JOIN profiles pp ON pp.id = prof.profile_id
       WHERE c.id = $1`,
      [id],
    );
    return rows.length ? (rows[0] as unknown as Conversation) : null;
  }

  async findOrCreate({
    clientId,
    professionalId,
  }: {
    clientId: string;
    professionalId: string;
  }): Promise<Conversation> {
    const { rows } = await this.db.query(
      `INSERT INTO conversations (client_id, professional_id)
       VALUES ($1, $2)
       ON CONFLICT (client_id, professional_id)
         DO UPDATE SET last_message_at = conversations.last_message_at
       RETURNING *`,
      [clientId, professionalId],
    );
    return rows[0] as unknown as Conversation;
  }
}
