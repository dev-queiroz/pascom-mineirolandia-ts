import { Request, Response } from 'express';
import { generateMonthlyScalePDF } from '../services/pdfService';
import { AuthRequest } from '../middleware/auth';

export async function generateScalePDF(req: AuthRequest, res: Response) {
    try {
        const { month } = req.query;
        if (!month || typeof month !== 'string') return res.status(400).json({ error: 'Mês obrigatório' });

        const filePath = await generateMonthlyScalePDF(month);
        res.download(filePath, `escala-${month}.pdf`);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar PDF' });
    }
}