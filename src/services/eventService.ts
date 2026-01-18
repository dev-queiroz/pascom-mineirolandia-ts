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

export async function assignUserToSlot(eventId: number, slotOrder: number, userId: number) {
    // Verifica limite mensal, vaga livre, etc (adicionar regras depois)
    return prisma.eventSlot.updateMany({
        where: { eventId, order: slotOrder, userId: null },
        data: { userId },
    });
}