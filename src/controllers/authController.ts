import { Request, Response } from 'express';
import * as authService from '../services/authService';

export async function login(req: Request, res: Response) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }

        const result = await authService.loginUser(username, password);
        res.json(result);
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
}