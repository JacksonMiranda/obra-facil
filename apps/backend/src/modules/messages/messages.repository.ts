import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import type { IMessagesRepository, Message, MessageWithSender, Json } from '@obrafacil/shared';

@Injectable()
export class MessagesRepository implements IMessagesRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findByConversation(conversationId: string, limit = 50): Promise<MessageWithSender[]> {
    const { data, error } = await this.supabase.client
      .from('messages')
      .select('*, profiles!messages_sender_id_fkey(*)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as unknown as MessageWithSender[];
  }

  async create({ conversationId, senderId, content, metadata }: {
    conversationId: string;
    senderId: string;
    content: string;
    metadata?: Record<string, unknown>;
  }): Promise<Message> {
    const { data, error } = await this.supabase.client
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        metadata: (metadata ?? {}) as Json,
      })
      .select()
      .single();
    if (error) throw error;
    return data as Message;
  }
}
