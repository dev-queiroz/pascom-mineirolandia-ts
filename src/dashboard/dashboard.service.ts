import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminDashboard(month?: string) {
    const currentMonth =
      month || new Date().toISOString().slice(0, 7).slice(5, 7);

    const [pendencias, escalasCount, usersCount, justificativas] =
      await Promise.all([
        this.prisma.financial.findMany({
          where: { status: 'pendente' },
          select: { value: true },
        }),

        this.prisma.eventSlot.count({
          where: {
            userId: { not: null },
            event: { month: currentMonth },
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

        this.prisma.financial.aggregate({
          _sum: { value: true },
          where: { status: 'confirmado' },
          _count: true,
        }),
      ]);

    const pendenciasCount = pendencias.length;
    const pendenciasTotal = pendencias.reduce(
      (acc, p) => acc + Number(p.value),
      0,
    );

    const entradas = await this.prisma.financial.aggregate({
      _sum: { value: true },
      where: { status: 'confirmado', type: 'entrada' },
    });

    const saidas = await this.prisma.financial.aggregate({
      _sum: { value: true },
      where: { status: 'confirmado', type: 'saida' },
    });

    const saldoTotal =
      Number(entradas._sum.value ?? 0) - Number(saidas._sum.value ?? 0);

    const usersActive =
      usersCount.find((u) => u.situacao === 'ativo')?._count.id ?? 0;
    const usersInactive =
      usersCount.find((u) => u.situacao !== 'ativo')?._count.id ?? 0;

    return {
      pendencias: {
        count: pendenciasCount,
        total: pendenciasTotal,
      },
      escalasMes: escalasCount,
      usuarios: {
        ativos: usersActive,
        inativos: usersInactive,
      },
      ultimasJustificativas: justificativas,
      saldo: {
        total: saldoTotal,
        entradas: entradas._sum.value ?? 0,
        saidas: saidas._sum.value ?? 0,
      },
    };
  }
}
