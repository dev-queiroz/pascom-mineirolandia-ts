import PDFDocument from 'pdfkit';
import fs from 'fs';
import prisma from '../lib/prisma';

export async function generateMonthlyScalePDF(month: string): Promise<string> {
    const events = await prisma.event.findMany({
        where: { month },
        include: { slots: { include: { user: true } } },
        orderBy: [{ day: 'asc' }, { time: 'asc' }],
    });

    const doc = new PDFDocument({ margin: 50 });
    const filePath = `uploads/scale-${month}.pdf`;
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text(`Escala PASCOM - Mês ${month}`, { align: 'center' });
    doc.moveDown();

    events.forEach(event => {
        doc.fontSize(14).text(`${event.day}/${event.month} - ${event.time} - ${event.location}`);
        doc.fontSize(12).text(event.description || '');
        event.slots.forEach(slot => {
            doc.text(`  ${slot.order}. ${slot.function || 'Função'} → ${slot.user?.username || 'Vago'}`);
        });
        doc.moveDown();
    });

    doc.end();

    return filePath;
}