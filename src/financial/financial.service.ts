import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@Injectable()
export class FinancialService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async createContribution(
    dto: CreateContributionDto,
    userId: number,
    file?: Express.Multer.File,
  ) {
    if (isNaN(dto.value) || dto.value <= 0)
      throw new BadRequestException('Valor deve ser positivo');

    let receiptUrl: string | null = null;

    if (file) {
      const upload = await this.cloudinary.uploadImage(file);
      receiptUrl = upload.secure_url;
    }

    return this.prisma.financial.create({
      data: {
        type: 'entrada',
        value: Number(dto.value),
        date: new Date(dto.date),
        note: dto.note,
        receipt: receiptUrl,
        userId,
        status: 'pendente',
      },
    });
  }

  async getPendings(user: {
    userId: number;
    username: string;
    funcao: string;
  }) {
    const where: any = { status: 'pendente' };

    if (user.funcao !== 'admin') {
      where.userId = user.userId;
    }

    return this.prisma.financial.findMany({
      where,
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
