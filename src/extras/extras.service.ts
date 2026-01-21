import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ics from 'ics';

@Injectable()
export class ExtrasService {
  constructor(private prisma: PrismaService) {}

  async generateICS(eventId: number): Promise<string> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { slots: true },
    });

    if (!event) throw new BadRequestException('Evento não encontrado');

    const date = new Date(`2026-${event.month}-${event.day}`);
    const [hour, minute] = event.time.split(':').map(Number);

    const { error, value } = ics.createEvent({
      start: [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        hour,
        minute,
      ],
      duration: { hours: 2 },
      title: `Escala PASCOM - ${event.description || 'Evento'}`,
      description: `Local: ${event.location || 'Não especificado'}\nSlots: ${event.slots.length}`,
      location: event.location || 'Não especificado',
      status: 'CONFIRMED',
      alarms: [
        {
          action: 'display',
          description: 'Lembrete Escala PASCOM',
          trigger: { hours: 1, before: true },
        },
      ],
    });

    if (error) throw new BadRequestException('Erro ao gerar ICS');

    return value as string;
  }

  async generateWhatsAppLinks(month: string): Promise<string[]> {
    const events = await this.prisma.event.findMany({
      where: { month },
      orderBy: [{ day: 'asc' }, { time: 'asc' }],
    });

    return events.map((event) => {
      const message = `Lembrete: Evento PASCOM em ${event.day}/${month} às ${event.time}. Local: ${event.location}. Descrição: ${event.description}`;
      return `https://wa.me/?text=${encodeURIComponent(message)}`;
    });
  }
}
