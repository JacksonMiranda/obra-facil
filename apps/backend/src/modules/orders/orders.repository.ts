import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type {
  IOrdersRepository,
  Order,
  OrderWithStore,
} from '@obrafacil/shared';

const ORDERS_WITH_STORE = `
  SELECT
    o.id, o.client_id, o.store_id, o.material_list_id, o.status,
    o.total_amount, o.order_number, o.created_at, o.updated_at,
    json_build_object('id', s.id, 'name', s.name, 'logo_url', s.logo_url) AS stores
  FROM orders o
  INNER JOIN stores s ON s.id = o.store_id
`;

@Injectable()
export class OrdersRepository implements IOrdersRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAllByProfile(profileId: string): Promise<OrderWithStore[]> {
    const { rows } = await this.db.query(
      `${ORDERS_WITH_STORE} WHERE o.client_id = $1 ORDER BY o.created_at DESC`,
      [profileId],
    );
    return rows as unknown as OrderWithStore[];
  }

  async findById(id: string): Promise<OrderWithStore | null> {
    const { rows } = await this.db.query(
      `${ORDERS_WITH_STORE} WHERE o.id = $1`,
      [id],
    );
    return rows.length ? (rows[0] as unknown as OrderWithStore) : null;
  }

  async create({
    clientId,
    storeId,
    materialListId,
    totalAmount,
    orderNumber,
  }: {
    clientId: string;
    storeId: string;
    materialListId?: string;
    totalAmount: number;
    orderNumber: string;
  }): Promise<Order> {
    const { rows } = await this.db.query(
      `INSERT INTO orders (client_id, store_id, material_list_id, total_amount, order_number)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [clientId, storeId, materialListId ?? null, totalAmount, orderNumber],
    );
    return rows[0] as unknown as Order;
  }
}
