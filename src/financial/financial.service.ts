import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContributionDto } from './dto/create-contribution.dto';

@Injectable()
export class FinancialService {
  constructor(private prisma: PrismaService) {}

  async createContribution(
    dto: CreateContributionDto,
    userId: number,
    receiptPath?: string,
  ) {
    if (dto.value <= 0)
      throw new BadRequestException('Valor deve ser positivo');

    return this.prisma.financial.create({
      data: {
        type: 'entrada',
        value: dto.value,
        date: new Date(dto.date),
        time: dto.time ? new Date(dto.time) : null,
        note: dto.note,
        receipt: receiptPath,
        userId,
        status: 'pendente',
      },
    });
  }

  async getPendings() {
    return this.prisma.financial.findMany({
      where: { status: 'pendente' },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async confirmPendency(id: number) {
    return this.prisma.financial.update({
      where: { id },
      data: { status: 'confirmado' },
    });
  }

  async deletePendency(id: number) {
    return this.prisma.financial.delete({ where: { id } });
  }

  async getSummary(month?: string) {
    let where = {};
    if (month) {
      const start = new Date(`${month}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      where = {
        date: {
          gte: start,
          lt: end,
        },
      };
    }

    const entries = await this.prisma.financial.aggregate({
      _sum: { value: true },
      where: { ...where, type: 'entrada', status: 'confirmado' },
    });

    const exits = await this.prisma.financial.aggregate({
      _sum: { value: true },
      where: { ...where, type: 'saida', status: 'confirmado' },
    });

    const entradas = Number(entries._sum?.value ?? 0);
    const saidas = Number(exits._sum?.value ?? 0);

    return {
      entradas,
      saidas,
      saldo: entradas - saidas,
    };
  }
}
