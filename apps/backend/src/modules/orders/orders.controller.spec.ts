import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ClerkAuthGuard } from '../../core/guards/clerk-auth.guard';
import { ForbiddenException } from '@nestjs/common';
import type { Profile } from '@obrafacil/shared';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: jest.Mocked<OrdersService>;

  const mockProfile: Profile = {
    id: 'user-1',
    clerk_id: 'clerk-1',
    full_name: 'Alex',
    avatar_url: null,
    phone: null,
    role: 'client',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
      const result = await controller.findAll(mockProfile);
      expect(result).toEqual([]);
      expect(service.findAllByProfile).toHaveBeenCalledWith('user-1');
    });

    it('should throw ForbiddenException for non-clients', () => {
      const profProfile = { ...mockProfile, role: 'professional' as const };
      expect(() => controller.findAll(profProfile)).toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('should delegate to service for clients', async () => {
      const mockOrder = {
        id: 'order-1',
        client_id: 'user-1',
        store_id: 'store-1',
        material_list_id: null,
        status: 'pending' as const,
        total_amount: 100,
        order_number: 'ORD-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      service.create.mockResolvedValue(mockOrder);
      const body = { storeId: 'store-1', totalAmount: 100 };
      const result = await controller.create(mockProfile, body);
      expect(result).toEqual(mockOrder);
      expect(service.create).toHaveBeenCalledWith('user-1', body);
    });

    it('should throw ForbiddenException for pro-users', () => {
      const profProfile = { ...mockProfile, role: 'professional' as const };
      expect(() => controller.create(profProfile, {})).toThrow(
        ForbiddenException,
      );
    });
  });
});
