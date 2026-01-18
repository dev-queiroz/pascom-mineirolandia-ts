import { Request, Response } from 'express';
import * as financialService from '../services/financialService';
import { AuthRequest } from '../middleware/auth';

export async function addEntry(req: AuthRequest, res: Response) {
    try {
        const { value, date, time, note } = req.body;
        const receipt = req.file ? req.file.path : null; // assumindo multer configurado depois
        if (!req.user) return res.status(401).json({ error: 'Não autenticado' });

        const result = await financialService.addFinancial(
            'entrada',
            value,
            new Date(date),
            new Date(time),
            note,
            receipt,
            req.user.id,
            'pendente' // para usuário comum
        );
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export async function addExit(req: AuthRequest, res: Response) {
    try {
        if (req.user?.funcao !== 'admin') return res.status(403).json({ error: 'Acesso negado' });

        const { value, date, time, note } = req.body;
        const receipt = req.file ? req.file.path : null;

        const result = await financialService.addFinancial(
            'saida',
            value,
            new Date(date),
            new Date(time),
            note,
            receipt,
            req.user.id,
            'confirmado' // admin confirma direto
        );
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export async function getPendencias(req: AuthRequest, res: Response) {
    try {
        if (req.user?.funcao !== 'admin') return res.status(403).json({ error: 'Acesso negado' });

        const pendencias = await financialService.getPendencias();
        res.json(pendencias);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar pendências' });
    }
}

export async function confirmPendencia(req: AuthRequest, res: Response) {
    try {
        if (req.user?.funcao !== 'admin') return res.status(403).json({ error: 'Acesso negado' });

        const { id } = req.params;
        const result = await financialService.confirmPendencia(Number(id));
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export async function deletePendencia(req: AuthRequest, res: Response) {
    try {
        if (req.user?.funcao !== 'admin') return res.status(403).json({ error: 'Acesso negado' });

        const { id } = req.params;
        await financialService.deletePendencia(Number(id));
        res.json({ success: true });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export async function getResumo(req: AuthRequest, res: Response) {
    try {
        const { month } = req.query;
        const resumo = await financialService.getResumo(month as string | undefined);
        res.json(resumo);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao calcular resumo' });
    }
}