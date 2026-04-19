import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ClerkAuthGuard } from '../../core/guards/clerk-auth.guard';
import { ForbiddenException } from '@nestjs/common';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: jest.Mocked<OrdersService>;

  const mockProfile = {
    id: 'user-1',
    role: 'client' as const,
    name: 'Alex',
    clerk_id: 'clerk-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            findAllByProfile: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get(OrdersService);
  });

  describe('findAll', () => {
    it('should return all orders for clients', async () => {
      service.findAllByProfile.mockResolvedValue([]);
      const result = await controller.findAll(mockProfile as any);
      expect(result).toEqual([]);
      expect(service.findAllByProfile).toHaveBeenCalledWith('user-1');
    });

    it('should throw ForbiddenException for non-clients', () => {
      const profProfile = { ...mockProfile, role: 'professional' as const };
      expect(() => controller.findAll(profProfile as any)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('create', () => {
    it('should delegate to service for clients', async () => {
      service.create.mockResolvedValue({ id: 'order-1' } as any);
      const body = { storeId: 'store-1', totalAmount: 100 };
      const result = await controller.create(mockProfile as any, body);
      expect(result).toEqual({ id: 'order-1' });
      expect(service.create).toHaveBeenCalledWith('user-1', body);
    });

    it('should throw ForbiddenException for pro-users', () => {
      const profProfile = { ...mockProfile, role: 'professional' as const };
      expect(() => controller.create(profProfile as any, {})).toThrow(
        ForbiddenException,
      );
    });
  });
});
