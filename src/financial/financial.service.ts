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
    if (isNaN(dto.value) || dto.value <= 0)
      throw new BadRequestException('Valor deve ser positivo');

    return this.prisma.financial.create({
      data: {
        type: 'entrada',
        value: dto.value,
        date: new Date(dto.date),
        time: dto.time || null,
        note: dto.note,
        receipt: receiptPath ? `/uploads/${receiptPath}` : null,
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
    const where: any = { status: 'confirmado' };

    if (month) {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        throw new BadRequestException('Formato de mês inválido. Use YYYY-MM');
      }

      const start = new Date(`${month}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      where.date = {
        gte: start,
        lt: end,
      };
    }

    const stats = await this.prisma.financial.groupBy({
      by: ['type'],
      _sum: { value: true },
      where: where,
    });

    const entradas = Number(
      stats.find((s) => s.type === 'entrada')?._sum.value ?? 0,
    );
    const saidas = Number(
      stats.find((s) => s.type === 'saida')?._sum.value ?? 0,
    );

    return {
      entradas,
      saidas,
      saldo: entradas - saidas,
    };
  }
}
