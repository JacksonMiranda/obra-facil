import { Test, TestingModule } from '@nestjs/testing';
import { OrdersRepository } from './orders.repository';
import { DatabaseService } from '../../database/database.service';
import { QueryResult } from 'pg';

describe('OrdersRepository', () => {
  let repo: OrdersRepository;
  let db: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersRepository,
        {
          provide: DatabaseService,
          useValue: {
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    repo = module.get<OrdersRepository>(OrdersRepository);
    db = module.get(DatabaseService);
  });

  describe('findAllByProfile', () => {
    it('should query orders with store info', async () => {
      db.query.mockResolvedValue({ rows: [] } as unknown as QueryResult);
      const result = await repo.findAllByProfile('user-1');
      expect(result).toEqual([]);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE o.client_id = $1'),
        ['user-1'],
      );
    });
  });

  describe('findById', () => {
    it('should return order if found', async () => {
      const mockOrder = { id: 'order-1' };
      db.query.mockResolvedValue({ rows: [mockOrder] } as unknown as QueryResult);
      const result = await repo.findById('order-1');
      expect(result).toEqual(mockOrder);
    });

    it('should return null if not found', async () => {
      db.query.mockResolvedValue({ rows: [] } as unknown as QueryResult);
      const result = await repo.findById('order-1');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should insert a new order', async () => {
      const mockOrder = { id: 'order-1' };
      db.query.mockResolvedValue({ rows: [mockOrder] } as unknown as QueryResult);
      const input = {
        clientId: 'client-1',
        storeId: 'store-1',
        totalAmount: 100,
        orderNumber: 'ORD-123',
      };
      const result = await repo.create(input);
      expect(result).toEqual(mockOrder);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO orders'),
        ['client-1', 'store-1', null, 100, 'ORD-123'],
      );
    });
  });
});
