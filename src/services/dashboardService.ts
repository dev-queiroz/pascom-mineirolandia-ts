import prisma from '../lib/prisma';

export async function getAdminDashboard(month: string = new Date().toISOString().slice(0, 7)) {
    const [pendenciasCount, escalasCount, usersCount, justificativas, saldo] = await Promise.all([
        // Pendências financeiras
        prisma.financial.count({ where: { status: 'pendente' } }),

        // Escalas do mês atual
        prisma.eventSlot.count({
            where: {
                event: { month: month.slice(5, 7) }, // ex: "01" para janeiro
                userId: { not: null },
            },
        }),

        // Usuários ativos/inativos
        prisma.user.groupBy({
            by: ['situacao'],
            _count: { id: true },
        }),

        // Últimas 5 justificativas
        prisma.justification.findMany({
            take: 5,
            orderBy: { timestamp: 'desc' },
            include: { user: { select: { username: true } } },
        }),

        // Saldo financeiro confirmado
        prisma.financial.groupBy({
            by: ['type'],
            where: { status: 'confirmado' },
            _sum: { value: true },
        }),
    ]);

    const saldoTotal = (Number(saldo.find(s => s.type === 'entrada')?._sum.value) || 0) -
        (Number(saldo.find(s => s.type === 'saida')?._sum.value) || 0);

    const usersActive = usersCount.find(u => u.situacao === 'ativo')?._count.id || 0;
    const usersInactive = usersCount.find(u => u.situacao !== 'ativo')?._count.id || 0;

    return {
        pendencias: pendenciasCount,
        escalasMes: escalasCount,
        usuarios: { ativos: usersActive, inativos: usersInactive },
        ultimasJustificativas: justificativas,
        saldo: { total: saldoTotal },
    };
}