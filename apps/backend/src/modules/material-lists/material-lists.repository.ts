import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type {
  IMaterialListsRepository,
  MaterialList,
  MaterialItem,
} from '@obrafacil/shared';

@Injectable()
export class MaterialListsRepository implements IMaterialListsRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAllByProfessional(professionalId: string): Promise<MaterialList[]> {
    const { rows } = await this.db.query(
      `SELECT * FROM material_lists WHERE professional_id = $1 ORDER BY created_at DESC`,
      [professionalId],
    );
    return rows as unknown as MaterialList[];
  }

  async findById(id: string): Promise<MaterialList | null> {
    const { rows } = await this.db.query(
      `SELECT
         ml.*,
         COALESCE(
           (SELECT json_agg(mi ORDER BY mi.created_at)
            FROM material_items mi WHERE mi.material_list_id = ml.id),
           '[]'::json
         ) AS material_items
       FROM material_lists ml
       WHERE ml.id = $1`,
      [id],
    );
    return rows.length ? (rows[0] as unknown as MaterialList) : null;
  }

  async create({
    professionalId,
    conversationId,
  }: {
    professionalId: string;
    conversationId: string;
  }): Promise<MaterialList> {
    const { rows } = await this.db.query(
      `INSERT INTO material_lists (professional_id, conversation_id)
       VALUES ($1, $2)
       RETURNING *`,
      [professionalId, conversationId],
    );
    return rows[0] as unknown as MaterialList;
  }

  async addItem({
    materialListId,
    name,
    quantity,
    unit,
  }: {
    materialListId: string;
    name: string;
    quantity: number;
    unit: string;
  }): Promise<MaterialItem> {
    const { rows } = await this.db.query(
      `INSERT INTO material_items (material_list_id, name, quantity, unit)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [materialListId, name, quantity, unit],
    );
    return rows[0] as unknown as MaterialItem;
  }
}
