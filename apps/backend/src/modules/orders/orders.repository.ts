import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import type { IOrdersRepository, Order, OrderWithStore } from '@obrafacil/shared';

@Injectable()
export class OrdersRepository implements IOrdersRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findAllByProfile(profileId: string): Promise<OrderWithStore[]> {
    const { data, error } = await this.supabase.client
      .from('orders')
      .select('*, stores(*)')
      .eq('client_id', profileId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as OrderWithStore[];
  }

  async findById(id: string): Promise<OrderWithStore | null> {
    const { data, error } = await this.supabase.client
      .from('orders')
      .select('*, stores(*)')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as unknown as OrderWithStore;
  }

  async create({ clientId, storeId, materialListId, totalAmount, orderNumber }: {
    clientId: string;
    storeId: string;
    materialListId?: string;
    totalAmount: number;
    orderNumber: string;
  }): Promise<Order> {
    const { data, error } = await this.supabase.client
      .from('orders')
      .insert({
        client_id: clientId,
        store_id: storeId,
        material_list_id: materialListId ?? null,
        total_amount: totalAmount,
        order_number: orderNumber,
      })
      .select()
      .single();
    if (error) throw error;
    return data as Order;
  }
}
