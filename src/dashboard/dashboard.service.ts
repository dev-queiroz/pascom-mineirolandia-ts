import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminDashboard(
    month: string = new Date().toISOString().slice(0, 7),
  ) {
    const [pendenciasCount, escalasCount, usersCount, justificativas, saldo] =
      await Promise.all([
        this.prisma.financial.count({ where: { status: 'pendente' } }),

        this.prisma.eventSlot.count({
          where: {
            event: { month: month.slice(5, 7) },
            userId: { not: null },
          },
        }),

        this.prisma.user.groupBy({
          by: ['situacao'],
          _count: { id: true },
        }),

        this.prisma.justification.findMany({
          take: 5,
          orderBy: { timestamp: 'desc' },
          include: { user: { select: { username: true } } },
        }),

        this.prisma.financial.groupBy({
          by: ['type'],
          where: { status: 'confirmado' },
          _sum: { value: true },
        }),
      ]);

    const saldoTotal =
      Number(saldo.find((s) => s.type === 'entrada')?._sum.value ?? 0) -
      Number(saldo.find((s) => s.type === 'saida')?._sum.value ?? 0);

    const usersActive =
      usersCount.find((u) => u.situacao === 'ativo')?._count.id ?? 0;
    const usersInactive = usersCount.reduce(
      (acc, u) => acc + (u.situacao !== 'ativo' ? u._count.id : 0),
      0,
    );

    return {
      pendencias: pendenciasCount,
      escalasMes: escalasCount,
      usuarios: { ativos: usersActive, inativos: usersInactive },
      ultimasJustificativas: justificativas,
      saldo: { total: saldoTotal },
    };
  }
}
