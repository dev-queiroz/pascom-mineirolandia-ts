import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existing) {
      throw new ConflictException('Username já existe');
    }

    const hashedPassword = await argon2.hash(dto.password);

    return this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        phone: dto.phone,
        escalacao: dto.escalacao,
        situacao: dto.situacao || 'ativo',
        setor: dto.setor,
        funcao: dto.funcao || 'user',
        acompanhante: dto.acompanhante || 'nao',
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        phone: true,
        escalacao: true,
        situacao: true,
        setor: true,
        funcao: true,
        acompanhante: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        phone: true,
        escalacao: true,
        situacao: true,
        setor: true,
        funcao: true,
        acompanhante: true,
        createdAt: true,
      },
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    if (dto.password) {
      dto.password = await argon2.hash(dto.password);
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
