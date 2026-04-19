import { Test, TestingModule } from '@nestjs/testing';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';
import { ProfessionalsRepository } from '../professionals/professionals.repository';
import { ClerkAuthGuard } from '../../core/guards/clerk-auth.guard';
import { ForbiddenException } from '@nestjs/common';
import type {
  Profile,
  ProfessionalWithProfile,
  Visit,
  AvailabilitySlot,
  VisitWithProfessional,
  VisitWithClient,
} from '@obrafacil/shared';

describe('VisitsController', () => {
  let controller: VisitsController;
  let service: jest.Mocked<VisitsService>;
  let proRepo: jest.Mocked<ProfessionalsRepository>;

  const mockProfile: Profile = {
    id: 'user-1',
    clerk_id: 'clerk-1',
    full_name: 'Alex',
    avatar_url: null,
    phone: null,
    role: 'professional',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockPro: ProfessionalWithProfile = {
    id: 'pro-1',
    profile_id: 'user-1',
    specialty: 'eletricista',
    bio: null,
    rating_avg: 5,
    jobs_completed: 10,
    is_verified: true,
    latitude: null,
    longitude: null,
    created_at: new Date().toISOString(),
    profiles: mockProfile,
  };

  const mockVisit: VisitWithProfessional & VisitWithClient = {
    id: 'v1',
    client_id: 'client-1',
    professional_id: 'pro-1',
    scheduled_at: new Date().toISOString(),
    status: 'confirmed',
    address: 'Street 1, City',
    notes: 'Gate code 1234',
    cancelled_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    professionals: mockPro,
    client: {
      ...mockProfile,
      id: 'client-1',
      role: 'client',
    },
  };

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
      proRepo.findByProfileId.mockResolvedValue(mockPro);
      service.getMyAvailability.mockResolvedValue([]);

      const result = await controller.getMyAvailability(mockProfile);
      expect(result).toEqual([]);
      expect(proRepo.findByProfileId).toHaveBeenCalledWith('user-1');
      expect(service.getMyAvailability).toHaveBeenCalledWith('pro-1');
    });

    it('should throw Forbidden if not professional', async () => {
      const clientProfile: Profile = { ...mockProfile, role: 'client' };
      await expect(controller.getMyAvailability(clientProfile)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw Forbidden if professional profile not found', async () => {
      proRepo.findByProfileId.mockResolvedValue(null);
      await expect(controller.getMyAvailability(mockProfile)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should set availability', async () => {
      proRepo.findByProfileId.mockResolvedValue(mockPro);
      service.setAvailability.mockResolvedValue([] as AvailabilitySlot[]);

      const result = await controller.setAvailability(mockProfile, []);
      expect(result).toEqual([]);
      expect(service.setAvailability).toHaveBeenCalledWith('pro-1', []);
    });
  });

  describe('visits', () => {
    it('should return all visits for a profile', async () => {
      service.findAll.mockResolvedValue(
        [] as VisitWithProfessional[] | VisitWithClient[],
      );
      const result = await controller.findAll(mockProfile);
      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledWith(mockProfile);
    });

    it('should find one visit by id', async () => {
      service.findById.mockResolvedValue(
        mockVisit as VisitWithProfessional & VisitWithClient,
      );
      const result = await controller.findOne('v1');
      expect(result).toEqual(mockVisit);
    });

    it('should allow clients to book visits', async () => {
      const clientProfile: Profile = {
        ...mockProfile,
        id: 'client-1',
        role: 'client',
      };
      service.book.mockResolvedValue(mockVisit);

      const result = await controller.book(clientProfile, {
        date: 'today',
      } as any);
      expect(result).toEqual(mockVisit);
      expect(service.book).toHaveBeenCalledWith('client-1', { date: 'today' });
    });

    it('should block professionals from booking visits', () => {
      expect(() => controller.book(mockProfile, {} as any)).toThrow(
        ForbiddenException,
      );
    });

    it('should cancel a visit', async () => {
      service.cancel.mockResolvedValue({ ...mockVisit, status: 'cancelled' });
      const result = await controller.cancel('v1', mockProfile);
      expect(result).toEqual({ ...mockVisit, status: 'cancelled' });
    });

    it('should complete a visit', async () => {
      service.complete.mockResolvedValue({ ...mockVisit, status: 'completed' });
      const result = await controller.complete('v1', mockProfile);
      expect(result).toEqual({ ...mockVisit, status: 'completed' });
    });
  });
});
