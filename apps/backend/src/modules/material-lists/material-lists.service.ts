import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MaterialListsRepository } from './material-lists.repository';
import {
  CreateMaterialListSchema,
  AddMaterialItemSchema,
} from '@obrafacil/shared';
import type { MaterialList, MaterialItem } from '@obrafacil/shared';

@Injectable()
export class MaterialListsService {
  constructor(private readonly repo: MaterialListsRepository) {}

  async findAllByProfessional(professionalId: string): Promise<MaterialList[]> {
    return this.repo.findAllByProfessional(professionalId);
  }

  async findById(id: string): Promise<MaterialList | null> {
    return this.repo.findById(id);
  }

  async create(
    professionalId: string,
    rawInput: unknown,
  ): Promise<MaterialList> {
    const input = CreateMaterialListSchema.parse(rawInput);
    return this.repo.create({
      professionalId,
      conversationId: input.conversationId,
    });
  }

  async addItem(
    professionalId: string,
    listId: string,
    rawInput: unknown,
  ): Promise<MaterialItem> {
    const input = AddMaterialItemSchema.parse({
      ...(rawInput as Record<string, unknown>),
      materialListId: listId,
    });

    const list = await this.repo.findById(input.materialListId);
    if (!list) throw new NotFoundException('Lista não encontrada');
    if (
      (list as MaterialList & { professional_id: string }).professional_id !==
      professionalId
    ) {
      throw new ForbiddenException('Acesso negado');
    }

    return this.repo.addItem(input);
  }
}
