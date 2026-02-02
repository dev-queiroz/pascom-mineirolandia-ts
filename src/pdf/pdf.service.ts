import { Injectable, BadRequestException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import { join } from 'path';

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

    if (!existsSync('uploads')) mkdirSync('uploads');

    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      bufferPages: true,
    });

    const filePath = `uploads/scale-${month}.pdf`;
    const stream = createWriteStream(filePath);

    await new Promise((resolve, reject) => {
      doc.pipe(stream);
      stream.on('finish', resolve);
      stream.on('error', reject);

      const primaryColor = '#1e3a8a';
      const secondaryColor = '#4b5563';
      const accentColor = '#f8fafc';
      const detailColor = '#6366f1';

      // --- CABEÇALHO ---
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

      const headerY = 38;

      if (existsSync(logoPascom)) {
        doc.image(logoPascom, 50, headerY + 6, { width: 72 });
      }

      if (existsSync(logoParoquia)) {
        doc.image(logoParoquia, 495, headerY - 6, { width: 52 });
      }

      // Título Centralizado
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
        .text('PASCOM - Pastoral da Comunicação', {
          align: 'center',
          width: 375,
        })
        .text(`Mês de Referência: ${month}/2026`, {
          align: 'center',
          width: 375,
        });

      // Espaçamento extra antes da linha para não sufocar o cabeçalho
      doc.moveDown(2.5);

      const lineY = doc.y; // Salva a posição da linha
      doc
        .strokeColor(primaryColor)
        .lineWidth(0.5)
        .moveTo(50, lineY)
        .lineTo(545, lineY)
        .stroke();

      // Margem de segurança após a linha para o conteúdo não ser cortado
      doc.moveDown(3);

      // --- LISTAGEM DE EVENTOS ---
      events.forEach((event) => {
        // Se o cursor estiver muito embaixo, pula para garantir que o bloco não quebre
        if (doc.y > 680) doc.addPage();

        const currentY = doc.y;

        // Card do título do evento
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

        // Detalhes Local/Hora
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
          .text(`HORÁRIO: `, { continued: true })
          .font('Helvetica')
          .text(`${event.time}`);

        doc.moveDown(1.2);

        // Slots/Voluntários
        event.slots
          .sort((a, b) => a.order - b.order)
          .forEach((slot, index) => {
            const rowY = doc.y;

            if (index % 2 === 0) {
              doc.rect(65, rowY - 2, 465, 15).fill('#f1f5f9');
            }

            doc
              .fillColor(detailColor)
              .font('Helvetica-Bold')
              .fontSize(10)
              .text(`${slot.function || 'Função'}:`, 75, rowY, { width: 140 });

            doc
              .fillColor('#1f2937')
              .font('Helvetica-Bold')
              .text(
                `${slot.user?.username?.toUpperCase() || '--- DISPONÍVEL ---'}`,
                215,
                rowY,
              );

            doc.moveDown(0.5);
          });

        doc.moveDown(2.5); // Espaço entre um evento e outro
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
    });

    return filePath;
  }
}
