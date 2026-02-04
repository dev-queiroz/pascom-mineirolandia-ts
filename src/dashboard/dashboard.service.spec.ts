import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockPrisma = {
    financial: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    eventSlot: {
      count: jest.fn(),
    },
    user: {
      groupBy: jest.fn(),
    },
    justification: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('getAdminDashboard', () => {
    it('should return complete dashboard data with calculated totals', async () => {
      mockPrisma.financial.findMany.mockResolvedValueOnce([
        { value: 100 },
        { value: 250 },
      ]);

      mockPrisma.eventSlot.count.mockResolvedValue(15);

      mockPrisma.user.groupBy.mockResolvedValue([
        { situacao: 'ativo', _count: { id: 10 } },
        { situacao: 'inativo', _count: { id: 2 } },
      ]);

      mockPrisma.justification.findMany.mockResolvedValue([
        { id: 1, user: { username: 'Teste' } },
      ]);

      mockPrisma.financial.aggregate.mockResolvedValueOnce({
        _sum: { value: 500 },
        _count: 5,
      });

      mockPrisma.financial.aggregate
        .mockResolvedValueOnce({ _sum: { value: 1000 } })
        .mockResolvedValueOnce({ _sum: { value: 400 } });

      const result = await service.getAdminDashboard('02');

      expect(result.pendencias.count).toBe(2);
      expect(result.pendencias.total).toBe(350);
      expect(result.usuarios.ativos).toBe(10);
      expect(result.usuarios.inativos).toBe(2);
      expect(result.saldo.total).toBe(600);
      expect(result.escalasMes).toBe(15);
    });

    it('should use current month if no month is provided', async () => {
      mockPrisma.financial.findMany.mockResolvedValue([]);
      mockPrisma.eventSlot.count.mockResolvedValue(0);
      mockPrisma.user.groupBy.mockResolvedValue([]);
      mockPrisma.justification.findMany.mockResolvedValue([]);
      mockPrisma.financial.aggregate.mockResolvedValue({ _sum: { value: 0 } });

      await service.getAdminDashboard();

      expect(mockPrisma.eventSlot.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            event: { month: expect.stringMatching(/^\d{2}$/) },
          }),
        }),
      );
    });

    it('should handle null values in financial aggregates (fallback to 0)', async () => {
      mockPrisma.financial.findMany.mockResolvedValue([]);
      mockPrisma.eventSlot.count.mockResolvedValue(0);
      mockPrisma.user.groupBy.mockResolvedValue([]);
      mockPrisma.justification.findMany.mockResolvedValue([]);

      mockPrisma.financial.aggregate.mockResolvedValue({
        _sum: { value: null },
      });

      const result = await service.getAdminDashboard('05');

      expect(result.saldo.total).toBe(0);
      expect(result.saldo.entradas).toBe(0);
      expect(result.saldo.saidas).toBe(0);
    });
  });
});
