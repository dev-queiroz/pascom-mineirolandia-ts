import { Request, Response } from 'express';
import * as eventService from '../services/eventService';
import { AuthRequest } from '../middleware/auth';

export async function getEvents(req: AuthRequest, res: Response) {
    try {
        const { month } = req.query;
        if (!month || typeof month !== 'string') return res.status(400).json({ error: 'Mês obrigatório' });

        const events = await eventService.getEventsByMonth(month);
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar eventos' });
    }
}

export async function createEvent(req: AuthRequest, res: Response) {
    try {
        if (req.user?.funcao !== 'admin') return res.status(403).json({ error: 'Acesso negado' });

        const data = req.body;
        const event = await eventService.createEvent(data);
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao criar evento' });
    }
}

export async function assignToSlot(req: AuthRequest, res: Response) {
    try {
        const { eventId, slotOrder } = req.body;
        if (!eventId || !slotOrder) return res.status(400).json({ error: 'Dados incompletos' });

        if (!req.user) return res.status(401).json({ error: 'Não autenticado' });

        const result = await eventService.assignUserToSlot(eventId, slotOrder, req.user.id);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export async function removeFromSlot(req: AuthRequest, res: Response) {
    try {
        const { eventId, slotOrder } = req.body;
        if (!eventId || !slotOrder) return res.status(400).json({ error: 'Dados incompletos' });

        if (!req.user) return res.status(401).json({ error: 'Não autenticado' });

        const result = await eventService.removeUserFromSlot(eventId, slotOrder, req.user.id);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}