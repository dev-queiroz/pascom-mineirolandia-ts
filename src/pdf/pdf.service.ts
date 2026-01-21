import { Injectable, BadRequestException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PdfService {
  constructor(private prisma: PrismaService) {}

  async generateMonthlyScalePDF(month: string): Promise<string> {
    if (!month.match(/^\d{2}$/))
      throw new BadRequestException('Mês inválido (MM)');

    const events = await this.prisma.event.findMany({
      where: { month },
      include: { slots: { include: { user: true } } },
      orderBy: [{ day: 'asc' }, { time: 'asc' }],
    });

    const doc = new PDFDocument({ margin: 50 });
    const filePath = `uploads/scale-${month}.pdf`;

    await new Promise((resolve, reject) => {
      doc
        .pipe(createWriteStream(filePath))
        .on('finish', resolve)
        .on('error', reject);

      doc
        .fontSize(20)
        .text(`Escala PASCOM - Mês ${month}`, { align: 'center' });
      doc.moveDown();

      events.forEach((event) => {
        doc
          .fontSize(14)
          .text(
            `${event.day}/${event.month} - ${event.time} - ${event.location || 'Sem local'}`,
          );
        doc.fontSize(12).text(event.description || 'Sem descrição');
        event.slots.forEach((slot) => {
          doc.text(
            `  ${slot.order}. ${slot.function || 'Função'} → ${slot.user?.username || 'Vago'}`,
          );
        });
        doc.moveDown();
      });

      doc.end();
    });

    return filePath;
  }
}
