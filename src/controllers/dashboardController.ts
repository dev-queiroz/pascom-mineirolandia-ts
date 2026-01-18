import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboardService';
import { AuthRequest } from '../middleware/auth';

export async function getDashboard(req: AuthRequest, res: Response) {
    try {
        if (req.user?.funcao !== 'admin') return res.status(403).json({ error: 'Acesso negado' });

        const { month } = req.query;
        const dashboard = await dashboardService.getAdminDashboard(month as string | undefined);
        res.json(dashboard);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar dashboard' });
    }
}