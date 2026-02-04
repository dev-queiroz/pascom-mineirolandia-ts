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

    const year = 2026;
    const month = parseInt(event.month, 10);
    const day = parseInt(event.day, 10);
    const [hour, minute] = event.time.split(':').map(Number);

    const { error, value } = ics.createEvent({
      start: [year, month, day, hour, minute],
      duration: { hours: 2 },
      title: `Escala PASCOM - ${event.description || 'Evento'}`,
      description: `Local: ${event.location || 'Não especificado'}\nFunções: ${event.slots.length}`,
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

    if (error) {
      console.error('Erro ICS:', error);
      throw new BadRequestException('Erro ao gerar arquivo de calendário');
    }

    return value as string;
  }

  async generateWhatsAppLinks(month: string): Promise<string[]> {
    const events = await this.prisma.event.findMany({
      where: { month },
      orderBy: [{ day: 'asc' }, { time: 'asc' }],
    });

    return events.map((event) => {
      const message = `*Lembrete PASCOM*\n\n📅 *Evento:* ${event.description}\n📍 *Local:* ${event.location}\n⏰ *Data/Hora:* ${event.day}/${month} às ${event.time}`;
      return `https://wa.me/?text=${encodeURIComponent(message)}`;
    });
  }
}
