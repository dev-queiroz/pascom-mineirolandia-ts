import prisma from '../lib/prisma';

export async function createJustification(
    userId: number,
    eventId: number,
    slotOrder: number,
    justification: string
) {
    if (!justification.trim()) throw new Error('Justificativa obrigatória');

    // Verifica se o slot pertence ao usuário
    const slot = await prisma.eventSlot.findFirst({
        where: { eventId, order: slotOrder, userId },
    });
    if (!slot) throw new Error('Slot não pertence ao usuário');

    return prisma.justification.create({
        data: {
            userId,
            eventId,
            slotOrder,
            justification,
        },
    });
}

export async function getAllJustifications() {
    return prisma.justification.findMany({
        include: { user: { select: { username: true } } },
        orderBy: { timestamp: 'desc' },
    });
}

export async function getJustificationsByEvent(eventId: number) {
    return prisma.justification.findMany({
        where: { eventId },
        include: { user: { select: { username: true } } },
    });
}