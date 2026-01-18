import ics from 'ics';
import prisma from '../lib/prisma';

export async function generateICS(eventId: number): Promise<string> {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error('Evento não encontrado');

    const date = new Date();
    const [year, month, day] = [date.getFullYear(), event.month, event.day];
    const [hour, minute] = event.time.split(':').map(Number);

    const { error, value } = ics.createEvent({
        start: [year, Number(month), Number(day), hour, minute],
        duration: { hours: 2 },
        title: `Escala PASCOM - ${event.description}`,
        description: `Local: ${event.location}`,
        location: event.location || 'Não especificado',
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        organizer: { name: 'PASCOM' },
    });

    if (error) throw new Error('Erro ao gerar ICS');

    return value!;
}