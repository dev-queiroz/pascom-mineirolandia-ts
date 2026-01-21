import { Injectable, BadRequestException } from '@nestjs/common';
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
    return this.prisma.event.findUnique({
      where: { id },
      include: { slots: { include: { user: { select: { username: true } } } } },
    });
  }

  async update(id: number, dto: UpdateEventDto) {
    return this.prisma.event.update({
      where: { id },
      data: {
        month: dto.month,
        day: dto.day,
        time: dto.time,
        description: dto.description,
        location: dto.location,
        // slots update complexo depois
      },
      include: { slots: true },
    });
  }

  async remove(id: number) {
    return this.prisma.event.delete({ where: { id } });
  }
}
