import { Test, TestingModule } from '@nestjs/testing';
import { MaterialListsController } from './material-lists.controller';
import { MaterialListsService } from './material-lists.service';
import { StoreOffersRepository } from './store-offers.repository';
import { ClerkAuthGuard } from '../../core/guards/clerk-auth.guard';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('MaterialListsController', () => {
  let controller: MaterialListsController;
  let service: jest.Mocked<MaterialListsService>;
  let storeOffersRepo: jest.Mocked<StoreOffersRepository>;

  const mockProfile = {
    id: 'prof-1',
    role: 'professional' as const,
    name: 'Alex',
    clerk_id: 'clerk-1',
  };

  const mockList = { id: 'list-1', professional_id: 'prof-1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialListsController],
      providers: [
        {
          provide: MaterialListsService,
          useValue: {
            findAllByProfessional: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            addItem: jest.fn(),
          },
        },
        {
          provide: StoreOffersRepository,
          useValue: {
            findByList: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MaterialListsController>(MaterialListsController);
    service = module.get(MaterialListsService);
    storeOffersRepo = module.get(StoreOffersRepository);
  });

  describe('findAll', () => {
    it('should return all lists for professional', async () => {
      service.findAllByProfessional.mockResolvedValue([mockList as any]);
      const result = await controller.findAll(mockProfile as any);
      expect(result).toEqual([mockList]);
    });

    it('should throw ForbiddenException for clients', () => {
      const clientProfile = { ...mockProfile, role: 'client' };
      expect(() => controller.findAll(clientProfile as any)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a list if found', async () => {
      service.findById.mockResolvedValue(mockList as any);
      const result = await controller.findOne(mockProfile as any, 'list-1');
      expect(result).toEqual(mockList);
    });

    it('should throw NotFoundException if list not found', async () => {
      service.findById.mockResolvedValue(null);
      await expect(controller.findOne(mockProfile as any, 'list-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should delegate creation to service', async () => {
      service.create.mockResolvedValue(mockList as any);
      const body = { conversationId: 'conv-1' };
      const result = await controller.create(mockProfile as any, body);
      expect(result).toEqual(mockList);
      expect(service.create).toHaveBeenCalledWith(mockProfile.id, body);
    });
  });

  describe('getOffers', () => {
    it('should delegate to storeOffersRepo', async () => {
      storeOffersRepo.findByList.mockResolvedValue([]);
      await controller.getOffers('list-1');
      expect(storeOffersRepo.findByList).toHaveBeenCalledWith('list-1');
    });
  });
});
