import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import type { IConversationsRepository, Conversation } from '@obrafacil/shared';

@Injectable()
export class ConversationsRepository implements IConversationsRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findAllByProfile(profileId: string): Promise<Conversation[]> {
    const { data, error } = await this.supabase.client
      .from('conversations')
      .select('*')
      .or(`client_id.eq.${profileId},professional_id.eq.${profileId}`)
      .order('last_message_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Conversation[];
  }

  async findById(id: string): Promise<Conversation | null> {
    const { data, error } = await this.supabase.client
      .from('conversations')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .select('*, client:profiles!conversations_client_id_fkey(*), professional:profiles!conversations_professional_id_fkey(*)' as any)
      .eq('id', id)
      .single();
    if (error) return null;
    return data as unknown as Conversation;
  }

  async findOrCreate({ clientId, professionalId }: {
    clientId: string;
    professionalId: string;
  }): Promise<Conversation> {
    const { data: existing } = await this.supabase.client
      .from('conversations')
      .select('*')
      .eq('client_id', clientId)
      .eq('professional_id', professionalId)
      .single();
    if (existing) return existing as Conversation;

    const { data, error } = await this.supabase.client
      .from('conversations')
      .insert({ client_id: clientId, professional_id: professionalId })
      .select()
      .single();
    if (error) throw error;
    return data as Conversation;
  }
}
