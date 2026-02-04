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
      // Mock para as pendências (findMany)
      mockPrisma.financial.findMany.mockResolvedValueOnce([
        { value: 100 },
        { value: 250 },
      ]);

      // Mock para escalas (count)
      mockPrisma.eventSlot.count.mockResolvedValue(15);

      // Mock para usuários (groupBy)
      mockPrisma.user.groupBy.mockResolvedValue([
        { situacao: 'ativo', _count: { id: 10 } },
        { situacao: 'inativo', _count: { id: 2 } },
      ]);

      // Mock para justificativas
      mockPrisma.justification.findMany.mockResolvedValue([
        { id: 1, user: { username: 'Teste' } },
      ]);

      // Mock para agregação geral (status confirmado)
      mockPrisma.financial.aggregate.mockResolvedValueOnce({
        _sum: { value: 500 },
        _count: 5,
      });

      // Mocks específicos para entradas e saídas
      mockPrisma.financial.aggregate
        .mockResolvedValueOnce({ _sum: { value: 1000 } }) // entradas
        .mockResolvedValueOnce({ _sum: { value: 400 } }); // saídas

      const result = await service.getAdminDashboard('02');

      // Verificações de cálculo
      expect(result.pendencias.count).toBe(2);
      expect(result.pendencias.total).toBe(350); // 100 + 250
      expect(result.usuarios.ativos).toBe(10);
      expect(result.usuarios.inativos).toBe(2);
      expect(result.saldo.total).toBe(600); // 1000 - 400
      expect(result.escalasMes).toBe(15);
    });

    it('should use current month if no month is provided', async () => {
      mockPrisma.financial.findMany.mockResolvedValue([]);
      mockPrisma.eventSlot.count.mockResolvedValue(0);
      mockPrisma.user.groupBy.mockResolvedValue([]);
      mockPrisma.justification.findMany.mockResolvedValue([]);
      mockPrisma.financial.aggregate.mockResolvedValue({ _sum: { value: 0 } });

      await service.getAdminDashboard();

      // Verifica se o Prisma foi chamado filtrando pelo mês atual (2 dígitos)
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

      // Força o retorno de _sum.value como null
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
