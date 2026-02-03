import { Injectable, BadRequestException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { existsSync } from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import { join } from 'path';
import { Response } from 'express';

@Injectable()
export class PdfService {
  constructor(private prisma: PrismaService) {}

  async generateMonthlyScalePDF(month: string, res: Response): Promise<void> {
    if (!month.match(/^\d{2}$/))
      throw new BadRequestException('Mês inválido (MM)');

    const events = await this.prisma.event.findMany({
      where: { month },
      include: { slots: { include: { user: true } } },
      orderBy: [{ day: 'asc' }, { time: 'asc' }],
    });

    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      bufferPages: true,
    });

    // Faz o pipe diretamente para a resposta do Express
    doc.pipe(res);

    const primaryColor = '#1e3a8a';
    const secondaryColor = '#4b5563';
    const accentColor = '#f8fafc';
    const detailColor = '#6366f1';

    // --- LOGOS ---
    const logoPascom = join(
      process.cwd(),
      'src',
      'assets',
      'brasao-pascom.png',
    );
    const logoParoquia = join(
      process.cwd(),
      'src',
      'assets',
      'brasao-paroquia.png',
    );

    if (existsSync(logoPascom)) doc.image(logoPascom, 50, 44, { width: 72 });
    if (existsSync(logoParoquia))
      doc.image(logoParoquia, 495, 32, { width: 52 });

    // --- CABEÇALHO ---
    doc
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .fontSize(20)
      .text('ESCALA MENSAL DE SERVIÇO', 110, 50, {
        align: 'center',
        width: 375,
      });

    doc
      .fillColor(secondaryColor)
      .font('Helvetica')
      .fontSize(10)
      .text('PASCOM - Pastoral da Comunicação', { align: 'center', width: 375 })
      .text(`Mês de Referência: ${month}/2026`, {
        align: 'center',
        width: 375,
      });

    doc.moveDown(2.5);
    doc
      .strokeColor(primaryColor)
      .lineWidth(0.5)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();
    doc.moveDown(3);

    // --- CONTEÚDO ---
    events.forEach((event) => {
      if (doc.y > 650) doc.addPage();
      const currentY = doc.y;

      doc.rect(50, currentY, 495, 30).fill(accentColor);
      doc
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(
          `${event.day}/${event.month} — ${event.description || 'Evento'}`,
          65,
          currentY + 10,
        );

      doc.moveDown(1.5);
      doc
        .fillColor(secondaryColor)
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(`LOCAL: `, 65, doc.y, { continued: true })
        .font('Helvetica')
        .text(`${event.location || 'Não informado'}   |   `, {
          continued: true,
        })
        .font('Helvetica-Bold')
        .text(`HORÁRIO: `)
        .font('Helvetica')
        .text(`${event.time}`, 330, doc.y - 10);

      doc.moveDown(0.5);

      event.slots
        .sort((a, b) => a.order - b.order)
        .forEach((slot, index) => {
          const rowY = doc.y;
          if (index % 2 === 0) doc.rect(65, rowY - 2, 465, 15).fill('#f1f5f9');
          doc
            .fillColor(detailColor)
            .font('Helvetica-Bold')
            .fontSize(10)
            .text(`${slot.function || 'Função'}:`, 75, rowY, { width: 140 });
          doc
            .fillColor('#1f2937')
            .text(
              `${slot.user?.username?.toUpperCase() || '--- DISPONÍVEL ---'}`,
              215,
              rowY,
            );
          doc.moveDown(0.5);
        });
      doc.moveDown(1.5);
    });

    // --- RODAPÉ ---
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .fillColor('#9ca3af')
        .text(
          `Documento Oficial PASCOM | Gerado em ${new Date().toLocaleDateString()}`,
          50,
          doc.page.height - 40,
          { align: 'left', continued: true },
        )
        .text(`Página ${i + 1} de ${range.count}`, { align: 'right' });
    }

    doc.end();
  }
}
