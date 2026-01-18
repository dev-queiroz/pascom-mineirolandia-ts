import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function loginUser(username: string, password: string) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw new Error('Usuário não encontrado');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Senha inválida');

    const token = jwt.sign(
        { id: user.id, username: user.username, funcao: user.funcao },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    return { token, user: { id: user.id, username: user.username, funcao: user.funcao } };
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}