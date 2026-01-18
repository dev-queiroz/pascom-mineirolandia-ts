import { Request, Response } from 'express';
import { generateICS } from '../services/icsService';

export async function getICS(req: Request, res: Response) {
    try {
        const { eventId } = req.query;
        if (!eventId || isNaN(Number(eventId))) return res.status(400).json({ error: 'ID inválido' });

        const icsContent = await generateICS(Number(eventId));
        res.set('Content-Type', 'text/calendar');
        res.set('Content-Disposition', 'attachment; filename="escala.ics"');
        res.send(icsContent);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}