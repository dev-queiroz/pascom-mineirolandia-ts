import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEventDto) {
    if (dto.slots?.some((s) => s.order < 1 || s.order > 10)) {
      throw new BadRequestException('Order dos slots deve ser entre 1 e 10');
    }

    const monthNum = Number(dto.month);
    const dayNum = Number(dto.day);
    if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
      throw new BadRequestException('Data inválida');
    }

    return this.prisma.event.create({
      data: {
        month: dto.month,
        day: dto.day,
        time: dto.time,
        description: dto.description,
        location: dto.location,
        slots: {
          create:
            dto.slots?.map((s) => ({
              function: s.function,
              order: s.order,
            })) || [],
        },
      },
      include: { slots: true },
    });
  }

  async findAll(month?: string) {
    return this.prisma.event.findMany({
      where: month ? { month } : undefined,
      include: { slots: { include: { user: { select: { username: true } } } } },
      orderBy: [{ day: 'asc' }, { time: 'asc' }],
    });
  }

  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { slots: { include: { user: { select: { username: true } } } } },
    });

    if (!event) throw new NotFoundException('Evento não encontrado');

    return event;
  }

  async update(id: number, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Evento não encontrado');

    return this.prisma.event.update({
      where: { id },
      data: {
        month: dto.month,
        day: dto.day,
        time: dto.time,
        description: dto.description,
        location: dto.location,
      },
      include: { slots: true },
    });
  }

  async remove(id: number) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Evento não encontrado');

    return this.prisma.event.delete({ where: { id } });
  }

  async assignSlot(eventId: number, slotOrder: number, userId: number) {
    // Busca slot + relação event
    const slot = await this.prisma.eventSlot.findFirst({
      where: { eventId, order: slotOrder },
      include: { event: true }, // <--- adiciona isso
    });
    if (!slot) throw new BadRequestException('Slot não encontrado');
    if (slot.userId) throw new BadRequestException('Vaga já ocupada');

    // Limite mensal
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const monthlyCount = await this.prisma.eventSlot.count({
      where: {
        userId,
        event: { month: slot.event.month }, // agora slot.event existe
      },
    });
    if (monthlyCount >= (user.escalacao || 2)) {
      throw new BadRequestException(
        `Limite mensal atingido (${user.escalacao || 2} escalas)`,
      );
    }

    // Mesmo dia
    const sameDay = await this.prisma.event.findFirst({
      where: {
        month: slot.event.month,
        day: slot.event.day,
        slots: { some: { userId } },
      },
    });
    if (sameDay)
      throw new BadRequestException('Usuário já escalado no mesmo dia');

    // Função específica
    if (
      slot.function?.toLowerCase().includes('acompanhante') &&
      user.acompanhante !== 'sim'
    ) {
      throw new BadRequestException('Usuário não habilitado para Acompanhante');
    }

    return this.prisma.eventSlot.updateMany({
      where: { id: slot.id, userId: null },
      data: { userId },
    });
  }

  async removeSlot(
    eventId: number,
    slotOrder: number,
    userId: number,
    justification: string,
  ) {
    if (!justification.trim())
      throw new BadRequestException('Justificativa obrigatória');

    const slot = await this.prisma.eventSlot.findFirst({
      where: { eventId, order: slotOrder, userId },
      include: { event: true }, // <--- adiciona isso (se precisar de dados do event depois)
    });
    if (!slot) throw new BadRequestException('Slot não pertence ao usuário');

    await this.prisma.justification.create({
      data: {
        userId,
        eventId,
        slotOrder,
        justification,
      },
    });

    return this.prisma.eventSlot.updateMany({
      where: { id: slot.id },
      data: { userId: null },
    });
  }
}
