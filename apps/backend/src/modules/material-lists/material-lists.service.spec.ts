import { Test, TestingModule } from '@nestjs/testing';
import { MaterialListsService } from './material-lists.service';
import { MaterialListsRepository } from './material-lists.repository';
import { OwnershipService } from '../../core/authorization/ownership.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { MaterialList } from '@obrafacil/shared';

describe('MaterialListsService', () => {
  let service: MaterialListsService;
  let repo: jest.Mocked<MaterialListsRepository>;

  const mockProfessionalId = '11111111-1111-4111-a111-111111111111';
  const mockListId = '22222222-2222-4222-a222-222222222222';
  const mockConversationId = '33333333-3333-4333-a333-333333333333';

  const mockMaterialList: MaterialList = {
    id: mockListId,
    professional_id: mockProfessionalId,
    conversation_id: mockConversationId,
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialListsService,
        OwnershipService,
        {
          provide: MaterialListsRepository,
          useValue: {
            findAllByProfessional: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            addItem: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MaterialListsService>(MaterialListsService);
    repo = module.get(MaterialListsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByProfessional', () => {
    it('should return all lists by professional', async () => {
      repo.findAllByProfessional.mockResolvedValue([mockMaterialList]);
      const result = await service.findAllByProfessional(mockProfessionalId);
      expect(result).toEqual([mockMaterialList]);
      expect(repo.findAllByProfessional).toHaveBeenCalledWith(
        mockProfessionalId,
      );
    });
  });

  describe('create', () => {
    it('should create a new list', async () => {
      const input = { conversationId: mockConversationId };
      repo.create.mockResolvedValue(mockMaterialList);
      const result = await service.create(mockProfessionalId, input);
      expect(result).toEqual(mockMaterialList);
      expect(repo.create).toHaveBeenCalledWith({
        professionalId: mockProfessionalId,
        conversationId: mockConversationId,
      });
    });
  });

  describe('addItem', () => {
    const itemInput = { name: 'Cimento', quantity: 10, unit: 'saco' };

    it('should add an item to the list', async () => {
      repo.findById.mockResolvedValue(mockMaterialList);
      repo.addItem.mockResolvedValue({
        id: 'item-1',
        material_list_id: mockListId,
        created_at: new Date().toISOString(),
        brand: null,
        image_url: null,
        ...itemInput,
      });

      const result = await service.addItem(
        mockProfessionalId,
        mockListId,
        itemInput,
      );
      expect(result.name).toBe('Cimento');
      expect(repo.addItem).toHaveBeenCalled();
    });

    it('should throw NotFoundException if list does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(
        service.addItem(mockProfessionalId, mockListId, itemInput),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own the list', async () => {
      repo.findById.mockResolvedValue(mockMaterialList);
      const otherProf = '44444444-4444-4444-a444-444444444444';
      await expect(
        service.addItem(otherProf, mockListId, itemInput),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
