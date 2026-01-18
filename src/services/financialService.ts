import prisma from '../lib/prisma';

export async function addFinancial(
    type: 'entrada' | 'saida',
    value: number,
    date: Date,
    time: Date,
    note: string,
    receipt: string | null,
    userId: number,
    status: string = 'pendente'
) {
    if (value <= 0) throw new Error('Valor deve ser maior que zero');

    return prisma.financial.create({
        data: { type, value, date, time, note, receipt, userId, status },
    });
}

export async function getPendencias() {
    return prisma.financial.findMany({
        where: { status: 'pendente' },
        include: { user: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
    });
}

export async function confirmPendencia(id: number) {
    return prisma.financial.update({
        where: { id },
        data: { status: 'confirmado' },
    });
}

export async function deletePendencia(id: number) {
    return prisma.financial.delete({ where: { id } });
}

export async function getResumo(month?: string) {
    const where = month ? { date: { gte: new Date(`${month}-01`), lte: new Date(`${month}-31`) } } : {};
    const entries = await prisma.financial.aggregate({
        _sum: { value: true },
        where: { ...where, type: 'entrada', status: 'confirmado' },
    });
    const exits = await prisma.financial.aggregate({
        _sum: { value: true },
        where: { ...where, type: 'saida', status: 'confirmado' },
    });

    return {
        entradas: entries._sum.value || 0,
        saidas: exits._sum.value || 0,
        saldo: (Number(entries._sum.value) || 0) - (Number(exits._sum.value) || 0),
    };
}