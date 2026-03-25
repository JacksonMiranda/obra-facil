import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import type { IWorksRepository, Work, WorkWithProfessional } from '@obrafacil/shared';

@Injectable()
export class WorksRepository implements IWorksRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findAllByClient(clientId: string): Promise<WorkWithProfessional[]> {
    const { data, error } = await this.supabase.client
      .from('works')
      .select('*, professionals(*, profiles!inner(*))')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as WorkWithProfessional[];
  }

  async findAllByProfessional(professionalId: string): Promise<WorkWithProfessional[]> {
    const { data, error } = await this.supabase.client
      .from('works')
      .select('*, professionals(*, profiles!inner(*))')
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as WorkWithProfessional[];
  }

  async findById(id: string): Promise<WorkWithProfessional | null> {
    const { data, error } = await this.supabase.client
      .from('works')
      .select('*, professionals(*, profiles!inner(*))')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as unknown as WorkWithProfessional;
  }

  async updateProgress(id: string, progressPct: number): Promise<Work> {
    const { data, error } = await this.supabase.client
      .from('works')
      .update({ progress_pct: progressPct })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Work;
  }
}
