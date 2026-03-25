import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import type { IStoreOffersRepository, StoreOfferWithStore } from '@obrafacil/shared';

@Injectable()
export class StoreOffersRepository implements IStoreOffersRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findBestOffers(materialListId: string): Promise<StoreOfferWithStore[]> {
    const { data, error } = await this.supabase.client
      .from('store_offers')
      .select('*, stores(*)')
      .eq('material_list_id', materialListId)
      .eq('is_best_price', true)
      .order('total_price', { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as StoreOfferWithStore[];
  }

  async findByList(materialListId: string): Promise<StoreOfferWithStore[]> {
    const { data, error } = await this.supabase.client
      .from('store_offers')
      .select('*, stores(*)')
      .eq('material_list_id', materialListId)
      .order('total_price', { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as StoreOfferWithStore[];
  }
}
