import { Injectable } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderSchema } from '@obrafacil/shared';
import type { Order, OrderWithStore } from '@obrafacil/shared';

@Injectable()
export class OrdersService {
  constructor(private readonly repo: OrdersRepository) {}

  async findAllByProfile(profileId: string): Promise<OrderWithStore[]> {
    return this.repo.findAllByProfile(profileId);
  }

  async create(clientId: string, rawInput: unknown): Promise<Order> {
    const input = CreateOrderSchema.parse(rawInput);
    return this.repo.create({
      clientId,
      storeId: input.storeId,
      materialListId: input.materialListId,
      totalAmount: input.totalAmount,
      orderNumber: input.orderNumber,
    });
  }
}
