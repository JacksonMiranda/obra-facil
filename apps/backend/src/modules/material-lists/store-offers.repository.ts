import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type {
  IStoreOffersRepository,
  StoreOfferWithStore,
} from '@obrafacil/shared';

const OFFERS_WITH_STORE = `
  SELECT
    so.id, so.store_id, so.material_list_id, so.total_price,
    so.delivery_info, so.is_best_price, so.created_at,
    row_to_json(s) AS stores
  FROM store_offers so
  INNER JOIN stores s ON s.id = so.store_id
`;

@Injectable()
export class StoreOffersRepository implements IStoreOffersRepository {
  constructor(private readonly db: DatabaseService) {}

  async findBestOffers(materialListId: string): Promise<StoreOfferWithStore[]> {
    const { rows } = await this.db.query(
      `${OFFERS_WITH_STORE}
       WHERE so.material_list_id = $1 AND so.is_best_price = true
       ORDER BY so.total_price ASC`,
      [materialListId],
    );
    return rows as unknown as StoreOfferWithStore[];
  }

  async findByList(materialListId: string): Promise<StoreOfferWithStore[]> {
    const { rows } = await this.db.query(
      `${OFFERS_WITH_STORE}
       WHERE so.material_list_id = $1
       ORDER BY so.total_price ASC`,
      [materialListId],
    );
    return rows as unknown as StoreOfferWithStore[];
  }
}
