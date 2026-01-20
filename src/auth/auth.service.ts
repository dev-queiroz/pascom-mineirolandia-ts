import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service'; // criaremos depois
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private prisma: PrismaService,
    ) {}

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { username: dto.username },
        });

        if (!user) throw new UnauthorizedException('Credenciais inválidas');

        const pwMatches = await argon2.verify(user.password, dto.password);
        if (!pwMatches) throw new UnauthorizedException('Credenciais inválidas');

        const payload = { sub: user.id, username: user.username, funcao: user.funcao };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}