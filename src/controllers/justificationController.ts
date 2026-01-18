import { Request, Response } from 'express';
import * as justificationService from '../services/justificationService';
import { AuthRequest } from '../middleware/auth';

export async function createJustification(req: AuthRequest, res: Response) {
    try {
        if (!req.user) return res.status(401).json({ error: 'Não autenticado' });

        const { eventId, slotOrder, justification } = req.body;
        if (!eventId || !slotOrder || !justification) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }

        const result = await justificationService.createJustification(
            req.user.id,
            eventId,
            slotOrder,
            justification
        );

        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export async function getAllJustifications(req: AuthRequest, res: Response) {
    try {
        if (req.user?.funcao !== 'admin') return res.status(403).json({ error: 'Acesso negado' });

        const justifications = await justificationService.getAllJustifications();
        res.json(justifications);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar justificativas' });
    }
}