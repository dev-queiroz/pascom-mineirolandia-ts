import prisma from '../lib/prisma';

export async function getEventsByMonth(month: string) {
    return prisma.event.findMany({
        where: { month },
        include: { slots: { include: { user: true } } },
        orderBy: [{ day: 'asc' }, { time: 'asc' }],
    });
}

export async function createEvent(data: {
    month: string;
    day: string;
    time: string;
    description?: string;
    location?: string;
    slots?: { function?: string; order: number }[];
}) {
    return prisma.event.create({
        data: {
            month: data.month,
            day: data.day,
            time: data.time,
            description: data.description,
            location: data.location,
            slots: {
                create: data.slots?.map(slot => ({
                    function: slot.function,
                    order: slot.order,
                })) || [],
            },
        },
        include: { slots: true },
    });
}

export async function assignUserToSlot(
    eventId: number,
    slotOrder: number,
    userId: number
) {
    // 1. Busca evento e slot
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { slots: true },
    });
    if (!event) throw new Error('Evento não encontrado');

    const slot = event.slots.find(s => s.order === slotOrder);
    if (!slot) throw new Error('Slot não encontrado');
    if (slot.userId) throw new Error('Vaga já ocupada');

    // 2. Verifica se usuário já está no mesmo dia (regra real do sistema)
    const sameDayEvents = await prisma.event.findMany({
        where: {
            month: event.month,
            day: event.day,
            slots: { some: { userId } },
        },
    });
    if (sameDayEvents.length > 0) throw new Error('Usuário já escalado no mesmo dia');

    // 3. Verifica limite mensal de escalação
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuário não encontrado');

    const monthlyCount = await prisma.eventSlot.count({
        where: {
            userId,
            event: { month: event.month },
        },
    });
    if (monthlyCount >= (user.escalacao || 2)) {
        throw new Error(`Limite mensal atingido (${user.escalacao || 2} escalas)`);
    }

    // 4. Verifica função específica (ex: acompanhante)
    if (slot.function?.toLowerCase().includes('acompanhante') && user.acompanhante !== 'sim') {
        throw new Error('Usuário não habilitado para função de Acompanhante');
    }

    // 5. Atribui
    await prisma.eventSlot.updateMany({
        where: { eventId, order: slotOrder, userId: null },
        data: { userId },
    });

    return { success: true, message: 'Escalado com sucesso' };
}

export async function removeUserFromSlot(eventId: number, slotOrder: number, userId: number) {
    const updated = await prisma.eventSlot.updateMany({
        where: { eventId, order: slotOrder, userId },
        data: { userId: null },
    });

    if (updated.count === 0) throw new Error('Não foi possível remover (vaga não pertence ao usuário)');

    return { success: true, message: 'Removido da escala' };
}