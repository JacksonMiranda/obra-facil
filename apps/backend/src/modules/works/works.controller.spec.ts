import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { WorksController } from './works.controller';
import { WorksRepository } from './works.repository';
import { ProfessionalsRepository } from '../professionals/professionals.repository';
import { ClerkAuthGuard } from '../../core/guards/clerk-auth.guard';
import type { Profile, WorkWithProfessional, ProfessionalWithProfile } from '@obrafacil/shared';

describe('WorksController', () => {
  let controller: WorksController;
  let worksRepo: jest.Mocked<WorksRepository>;
  let professionalsRepo: jest.Mocked<ProfessionalsRepository>;

  const mockProfile: Profile = {
    id: 'profile-id',
    clerk_id: 'clerk-id',
    full_name: 'Test User',
    avatar_url: null,
    phone: null,
    role: 'client',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockWork: WorkWithProfessional = {
    id: 'work-id',
    client_id: 'profile-id',
    professional_id: 'prof-id',
    title: 'Test Work',
    status: 'active',
    progress_pct: 50,
    next_step: null,
    photos: [],
    started_at: null,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    professionals: {} as any,
  };

  const mockProfessional: ProfessionalWithProfile = {
    id: 'prof-id',
    profile_id: 'profile-id',
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorksController],
      providers: [
        {
          provide: WorksRepository,
          useValue: {
            findAllByClient: jest.fn(),
            findAllByProfessional: jest.fn(),
            findById: jest.fn(),
            updateProgress: jest.fn(),
            updateStatus: jest.fn(),
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

    controller = module.get<WorksController>(WorksController);
    worksRepo = module.get(WorksRepository);
    professionalsRepo = module.get(ProfessionalsRepository);
  });

  describe('findAll', () => {
    it('should return works for client when role is client', async () => {
      worksRepo.findAllByClient.mockResolvedValue([mockWork]);
      const result = await controller.findAll(mockProfile);
      expect(result).toEqual([mockWork]);
      expect(worksRepo.findAllByClient).toHaveBeenCalledWith(mockProfile.id);
    });

    it('should return works for professional when role is professional', async () => {
      const proProfile = { ...mockProfile, role: 'professional' as const };
      professionalsRepo.findByProfileId.mockResolvedValue(mockProfessional);
      worksRepo.findAllByProfessional.mockResolvedValue([mockWork]);

      const result = await controller.findAll(proProfile);
      expect(result).toEqual([mockWork]);
      expect(professionalsRepo.findByProfileId).toHaveBeenCalledWith(proProfile.id);
      expect(worksRepo.findAllByProfessional).toHaveBeenCalledWith(mockProfessional.id);
    });

    it('should return empty array if professional profile is not found', async () => {
      const proProfile = { ...mockProfile, role: 'professional' as const };
      professionalsRepo.findByProfileId.mockResolvedValue(null);

      const result = await controller.findAll(proProfile);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a work if found', async () => {
      worksRepo.findById.mockResolvedValue(mockWork);
      const result = await controller.findOne('work-id');
      expect(result).toEqual(mockWork);
    });

    it('should throw NotFoundException if not found', async () => {
      worksRepo.findById.mockResolvedValue(null);
      await expect(controller.findOne('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProgress', () => {
    it('should update progress if professional is authorized', async () => {
      const proProfile = { ...mockProfile, role: 'professional' as const };
      worksRepo.findById.mockResolvedValue(mockWork);
      professionalsRepo.findByProfileId.mockResolvedValue(mockProfessional);
      worksRepo.updateProgress.mockResolvedValue({ ...mockWork, progress_pct: 75 } as any);

      const result = await controller.updateProgress('work-id', proProfile, { progressPct: 75 });
      expect(result.progress_pct).toBe(75);
    });

    it('should throw BadRequestException if progressPct is invalid', async () => {
      await expect(controller.updateProgress('id', mockProfile, { progressPct: 150 }))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if user is not a professional', async () => {
      worksRepo.findById.mockResolvedValue(mockWork);
      await expect(controller.updateProgress('work-id', mockProfile, { progressPct: 50 }))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('status transitions', () => {
    const proProfile = { ...mockProfile, role: 'professional' as const };

    it('should start a scheduled work', async () => {
      const scheduledWork = { ...mockWork, status: 'scheduled' as const };
      worksRepo.findById.mockResolvedValue(scheduledWork);
      professionalsRepo.findByProfileId.mockResolvedValue(mockProfessional);
      worksRepo.updateStatus.mockResolvedValue({ ...scheduledWork, status: 'active' } as any);

      const result = await controller.start('work-id', proProfile);
      expect(worksRepo.updateStatus).toHaveBeenCalledWith('work-id', 'active');
    });

    it('should throw ConflictException when starting a non-scheduled work', async () => {
      worksRepo.findById.mockResolvedValue(mockWork); // active
      professionalsRepo.findByProfileId.mockResolvedValue(mockProfessional);

      await expect(controller.start('work-id', proProfile)).rejects.toThrow(ConflictException);
    });

    it('should complete an active work', async () => {
      worksRepo.findById.mockResolvedValue(mockWork); // active
      professionalsRepo.findByProfileId.mockResolvedValue(mockProfessional);
      worksRepo.updateStatus.mockResolvedValue({ ...mockWork, status: 'completed' } as any);

      const result = await controller.complete('work-id', proProfile);
      expect(worksRepo.updateStatus).toHaveBeenCalledWith('work-id', 'completed');
    });

    it('should throw ConflictException when completing a non-active work', async () => {
      const scheduledWork = { ...mockWork, status: 'scheduled' as const };
      worksRepo.findById.mockResolvedValue(scheduledWork);
      professionalsRepo.findByProfileId.mockResolvedValue(mockProfessional);

      await expect(controller.complete('work-id', proProfile)).rejects.toThrow(ConflictException);
    });
  });
});
