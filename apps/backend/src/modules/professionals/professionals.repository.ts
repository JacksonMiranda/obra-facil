import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import type { IProfessionalsRepository, ProfessionalWithProfile } from '@obrafacil/shared';

@Injectable()
export class ProfessionalsRepository implements IProfessionalsRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async search({ query, city, limit = 20, offset = 0 }: {
    query?: string;
    service?: string;
    city?: string;
    limit?: number;
    offset?: number;
  }): Promise<ProfessionalWithProfile[]> {
    let q = this.supabase.client
      .from('professionals')
      .select('*, profiles!inner(*)')
      .order('rating_avg', { ascending: false })
      .range(offset, offset + limit - 1);

    if (query) {
      q = q.ilike('profiles.full_name', `%${query}%`);
    }
    if (city) {
      q = q.ilike('profiles.location', `%${city}%`);
    }

    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as unknown as ProfessionalWithProfile[];
  }

  async findById(id: string): Promise<ProfessionalWithProfile | null> {
    const { data, error } = await this.supabase.client
      .from('professionals')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .select('*, profiles!inner(*), services(*), reviews(*, profiles!reviews_reviewer_id_fkey(*))' as any)
      .eq('id', id)
      .single();
    if (error) return null;
    return data as unknown as ProfessionalWithProfile;
  }

  async findByClerkId(clerkId: string): Promise<ProfessionalWithProfile | null> {
    const { data, error } = await this.supabase.client
      .from('professionals')
      .select('*, profiles!inner(*)')
      .eq('profiles.clerk_id', clerkId)
      .single();
    if (error) return null;
    return data as unknown as ProfessionalWithProfile;
  }
}
