import { Test, TestingModule } from '@nestjs/testing';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';
import { ProfessionalsRepository } from '../professionals/professionals.repository';
import { ClerkAuthGuard } from '../../core/guards/clerk-auth.guard';
import { ForbiddenException } from '@nestjs/common';

describe('VisitsController', () => {
  let controller: VisitsController;
  let service: jest.Mocked<VisitsService>;
  let proRepo: jest.Mocked<ProfessionalsRepository>;

  const mockProfile = { id: 'user-1', role: 'professional' };
  const mockPro = { id: 'pro-1', profileId: 'user-1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisitsController],
      providers: [
        {
          provide: VisitsService,
          useValue: {
            getMyAvailability: jest.fn(),
            setAvailability: jest.fn(),
            getAvailableSlots: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            book: jest.fn(),
            cancel: jest.fn(),
            complete: jest.fn(),
          },
        },
        {
          provide: ProfessionalsRepository,
          useValue: {
            findByProfileId: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<VisitsController>(VisitsController);
    service = module.get(VisitsService);
    proRepo = module.get(ProfessionalsRepository);
  });

  describe('availability', () => {
    it('should get professional availability', async () => {
      proRepo.findByProfileId.mockResolvedValue(mockPro as any);
      service.getMyAvailability.mockResolvedValue([] as any);

      const result = await controller.getMyAvailability(mockProfile as any);
      expect(result).toEqual([]);
      expect(proRepo.findByProfileId).toHaveBeenCalledWith('user-1');
      expect(service.getMyAvailability).toHaveBeenCalledWith('pro-1');
    });

    it('should throw Forbidden if not professional', async () => {
      await expect(
        controller.getMyAvailability({ role: 'client' } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw Forbidden if professional profile not found', async () => {
      proRepo.findByProfileId.mockResolvedValue(null);
      await expect(controller.getMyAvailability(mockProfile as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should set availability', async () => {
      proRepo.findByProfileId.mockResolvedValue(mockPro as any);
      service.setAvailability.mockResolvedValue({ success: true } as any);

      const result = await controller.setAvailability(mockProfile as any, []);
      expect(result).toEqual({ success: true });
      expect(service.setAvailability).toHaveBeenCalledWith('pro-1', []);
    });
  });

  describe('visits', () => {
    it('should return all visits for a profile', async () => {
      service.findAll.mockResolvedValue([] as any);
      const result = await controller.findAll(mockProfile as any);
      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledWith(mockProfile);
    });

    it('should find one visit by id', async () => {
      service.findById.mockResolvedValue({ id: 'v1' } as any);
      const result = await controller.findOne('v1');
      expect(result).toEqual({ id: 'v1' });
    });

    it('should allow clients to book visits', async () => {
      const clientProfile = { id: 'client-1', role: 'client' };
      service.book.mockResolvedValue({ id: 'visit-1' } as any);

      const result = await controller.book(clientProfile as any, { date: 'today' });
      expect(result).toEqual({ id: 'visit-1' });
      expect(service.book).toHaveBeenCalledWith('client-1', { date: 'today' });
    });

    it('should block professionals from booking visits', () => {
      expect(() =>
        controller.book({ role: 'professional' } as any, {}),
      ).toThrow(ForbiddenException);
    });

    it('should cancel a visit', async () => {
      service.cancel.mockResolvedValue({ status: 'cancelled' } as any);
      const result = await controller.cancel('v1', mockProfile as any);
      expect(result).toEqual({ status: 'cancelled' });
    });

    it('should complete a visit', async () => {
      service.complete.mockResolvedValue({ status: 'completed' } as any);
      const result = await controller.complete('v1', mockProfile as any);
      expect(result).toEqual({ status: 'completed' });
    });
  });
});
