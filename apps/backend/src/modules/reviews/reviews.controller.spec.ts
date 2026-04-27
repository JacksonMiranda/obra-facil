import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsRepository } from './reviews.repository';
import { WorksRepository } from '../works/works.repository';
import { ProfessionalsRepository } from '../professionals/professionals.repository';
import { VisitsRepository } from '../visits/visits.repository';
import { ClerkAuthGuard } from '../../core/guards/clerk-auth.guard';
import type {
  AccountContext,
  Profile,
  WorkFull,
  VisitFull,
  ProfessionalWithProfile,
  ReviewWithReviewer,
} from '@obrafacil/shared';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let reviewsRepo: jest.Mocked<ReviewsRepository>;
  let worksRepo: jest.Mocked<WorksRepository>;
  let professionalsRepo: jest.Mocked<ProfessionalsRepository>;
  let visitsRepo: jest.Mocked<VisitsRepository>;

  const mockClientProfile: Profile = {
    id: 'client-profile-id',
    clerk_id: 'client-clerk-id',
    full_name: 'Carlos Cliente',
    avatar_url: null,
    avatar_id: null,
    phone: null,
    role: 'client',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockClientAccount: AccountContext = {
    profile: mockClientProfile,
    roles: ['client'],
    actingAs: 'client',
  };

  const mockProfessionalProfile: Profile = {
    id: 'pro-profile-id',
    clerk_id: 'pro-clerk-id',
    full_name: 'Ricardo Profissional',
    avatar_url: null,
    avatar_id: null,
    phone: null,
    role: 'professional',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockProfessional: ProfessionalWithProfile = {
    id: 'pro-id',
    profile_id: 'pro-profile-id',
    specialty: 'eletricista',
    bio: null,
    rating_avg: 4.5,
    jobs_completed: 10,
    is_verified: true,
    latitude: null,
    longitude: null,
    visibility_status: 'active',
    display_name: null,
    city: null,
    published_at: null,
    created_at: new Date().toISOString(),
    profiles: mockProfessionalProfile,
  };

  const mockCompletedWork: WorkFull = {
    id: 'work-id',
    client_id: 'client-profile-id',
    professional_id: 'pro-id',
    visit_id: 'visit-id',
    title: 'Instalação Elétrica',
    status: 'completed',
    progress_pct: 100,
    next_step: null,
    photos: [],
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    professionals: mockProfessional,
    client: mockClientProfile,
  };

  const mockCompletedVisit = {
    id: 'visit-id',
    status: 'completed',
  } as unknown as VisitFull;
  const mockCancelledVisit = {
    id: 'visit-id',
    status: 'cancelled',
  } as unknown as VisitFull;
  const mockRejectedVisit = {
    id: 'visit-id',
    status: 'rejected',
  } as unknown as VisitFull;

  const mockReview: ReviewWithReviewer = {
    id: 'review-id',
    work_id: 'work-id',
    professional_id: 'pro-id',
    reviewer_id: 'client-profile-id',
    rating: 5,
    comment: 'Excelente atendimento!',
    created_at: new Date().toISOString(),
    profiles: {
      id: 'client-profile-id',
      full_name: 'Carlos Cliente',
      avatar_url: null,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsRepository,
          useValue: {
            findByWorkId: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: WorksRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: ProfessionalsRepository,
          useValue: {
            findByProfileId: jest.fn(),
          },
        },
        {
          provide: VisitsRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReviewsController>(ReviewsController);
    reviewsRepo = module.get(ReviewsRepository);
    worksRepo = module.get(WorksRepository);
    professionalsRepo = module.get(ProfessionalsRepository);
    visitsRepo = module.get(VisitsRepository);
  });

  // ── POST :workId/review ────────────────────────────────────────────────────

  describe('createReview', () => {
    const createDto = { rating: 5, comment: 'Excelente atendimento!' };

    it('should create a review when the client submits for a completed work', async () => {
      worksRepo.findById.mockResolvedValue(mockCompletedWork);
      visitsRepo.findById.mockResolvedValue(mockCompletedVisit);
      professionalsRepo.findByProfileId.mockResolvedValue(null); // caller is not a professional
      reviewsRepo.findByWorkId.mockResolvedValue(null); // no existing review
      reviewsRepo.create.mockResolvedValue(
        mockReview as unknown as ReturnType<
          typeof reviewsRepo.create
        > extends Promise<infer T>
          ? T
          : never,
      );

      const result = await controller.createReview(
        'work-id',
        createDto,
        mockClientAccount,
      );

      expect(result).toEqual(mockReview);
      expect(reviewsRepo.create).toHaveBeenCalledWith({
        workId: 'work-id',
        professionalId: 'pro-id',
        reviewerId: 'client-profile-id',
        rating: 5,
        comment: 'Excelente atendimento!',
      });
    });

    it('should throw NotFoundException if work does not exist', async () => {
      worksRepo.findById.mockResolvedValue(null);

      await expect(
        controller.createReview('unknown-work', createDto, mockClientAccount),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if caller is not the client of the work', async () => {
      const strangerAccount: AccountContext = {
        profile: { ...mockClientProfile, id: 'stranger-id' },
        roles: ['client'],
        actingAs: 'client',
      };
      worksRepo.findById.mockResolvedValue(mockCompletedWork);

      await expect(
        controller.createReview('work-id', createDto, strangerAccount),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if the work is not yet completed', async () => {
      const activeWork = { ...mockCompletedWork, status: 'active' as const };
      worksRepo.findById.mockResolvedValue(activeWork);

      await expect(
        controller.createReview('work-id', createDto, mockClientAccount),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if the originating visit was cancelled', async () => {
      worksRepo.findById.mockResolvedValue(mockCompletedWork);
      visitsRepo.findById.mockResolvedValue(mockCancelledVisit);

      await expect(
        controller.createReview('work-id', createDto, mockClientAccount),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if the originating visit was rejected', async () => {
      worksRepo.findById.mockResolvedValue(mockCompletedWork);
      visitsRepo.findById.mockResolvedValue(mockRejectedVisit);

      await expect(
        controller.createReview('work-id', createDto, mockClientAccount),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ForbiddenException if the professional tries to review their own work', async () => {
      // Simulate a user who is the client of the work AND has a professional record
      // whose ID matches the work.professional_id — covers the self-review guard.
      const workWithProAsClient = {
        ...mockCompletedWork,
        client_id: 'pro-profile-id',
      };
      const proAccount: AccountContext = {
        profile: mockProfessionalProfile,
        roles: ['professional'],
        actingAs: 'professional',
      };
      worksRepo.findById.mockResolvedValue(workWithProAsClient);
      visitsRepo.findById.mockResolvedValue(mockCompletedVisit);
      professionalsRepo.findByProfileId.mockResolvedValue(mockProfessional);
      reviewsRepo.findByWorkId.mockResolvedValue(null);

      await expect(
        controller.createReview('work-id', createDto, proAccount),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if a review already exists for this work', async () => {
      worksRepo.findById.mockResolvedValue(mockCompletedWork);
      visitsRepo.findById.mockResolvedValue(mockCompletedVisit);
      professionalsRepo.findByProfileId.mockResolvedValue(null);
      reviewsRepo.findByWorkId.mockResolvedValue(mockReview);

      await expect(
        controller.createReview('work-id', createDto, mockClientAccount),
      ).rejects.toThrow(ConflictException);
    });

    it('should persist the review with correct work_id, professional_id and reviewer_id', async () => {
      worksRepo.findById.mockResolvedValue(mockCompletedWork);
      visitsRepo.findById.mockResolvedValue(mockCompletedVisit);
      professionalsRepo.findByProfileId.mockResolvedValue(null);
      reviewsRepo.findByWorkId.mockResolvedValue(null);
      reviewsRepo.create.mockResolvedValue(
        mockReview as unknown as ReturnType<
          typeof reviewsRepo.create
        > extends Promise<infer T>
          ? T
          : never,
      );

      await controller.createReview(
        'work-id',
        { rating: 4, comment: 'Bom trabalho' },
        mockClientAccount,
      );

      expect(reviewsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          workId: mockCompletedWork.id,
          professionalId: mockCompletedWork.professional_id,
          reviewerId: mockClientProfile.id,
        }),
      );
    });
  });

  // ── GET :workId/review ─────────────────────────────────────────────────────

  describe('getReview', () => {
    it('should return the review when the client is the work owner', async () => {
      worksRepo.findById.mockResolvedValue(mockCompletedWork);
      professionalsRepo.findByProfileId.mockResolvedValue(null);
      reviewsRepo.findByWorkId.mockResolvedValue(mockReview);

      const result = await controller.getReview('work-id', mockClientAccount);
      expect(result).toEqual(mockReview);
    });

    it('should return the review when the professional is the work owner', async () => {
      const proAccount: AccountContext = {
        profile: mockProfessionalProfile,
        roles: ['professional'],
        actingAs: 'professional',
      };
      worksRepo.findById.mockResolvedValue(mockCompletedWork);
      professionalsRepo.findByProfileId.mockResolvedValue(mockProfessional);
      reviewsRepo.findByWorkId.mockResolvedValue(mockReview);

      const result = await controller.getReview('work-id', proAccount);
      expect(result).toEqual(mockReview);
    });

    it('should return null when no review exists yet', async () => {
      worksRepo.findById.mockResolvedValue(mockCompletedWork);
      professionalsRepo.findByProfileId.mockResolvedValue(null);
      reviewsRepo.findByWorkId.mockResolvedValue(null);

      const result = await controller.getReview('work-id', mockClientAccount);
      expect(result).toBeNull();
    });

    it('should throw NotFoundException if work does not exist', async () => {
      worksRepo.findById.mockResolvedValue(null);

      await expect(
        controller.getReview('unknown-work', mockClientAccount),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if caller is neither client nor professional of the work', async () => {
      const strangerAccount: AccountContext = {
        profile: { ...mockClientProfile, id: 'stranger-id' },
        roles: ['client'],
        actingAs: 'client',
      };
      worksRepo.findById.mockResolvedValue(mockCompletedWork);
      professionalsRepo.findByProfileId.mockResolvedValue(null);

      await expect(
        controller.getReview('work-id', strangerAccount),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
