import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import type { IMaterialListsRepository, MaterialList, MaterialItem } from '@obrafacil/shared';

@Injectable()
export class MaterialListsRepository implements IMaterialListsRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findAllByProfessional(professionalId: string): Promise<MaterialList[]> {
    const { data, error } = await this.supabase.client
      .from('material_lists')
      .select('*')
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as MaterialList[];
  }

  async findById(id: string): Promise<MaterialList | null> {
    const { data, error } = await this.supabase.client
      .from('material_lists')
      .select('*, material_items(*)')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as unknown as MaterialList;
  }

  async create({ professionalId, conversationId }: {
    professionalId: string;
    conversationId: string;
  }): Promise<MaterialList> {
    const { data, error } = await this.supabase.client
      .from('material_lists')
      .insert({ professional_id: professionalId, conversation_id: conversationId })
      .select()
      .single();
    if (error) throw error;
    return data as MaterialList;
  }

  async addItem({ materialListId, name, quantity, unit }: {
    materialListId: string;
    name: string;
    quantity: number;
    unit: string;
  }): Promise<MaterialItem> {
    const { data, error } = await this.supabase.client
      .from('material_items')
      .insert({ material_list_id: materialListId, name, quantity, unit })
      .select()
      .single();
    if (error) throw error;
    return data as MaterialItem;
  }
}
