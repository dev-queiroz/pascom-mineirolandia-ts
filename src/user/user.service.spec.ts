import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

jest.mock('argon2', () => ({
  hash: jest.fn().mockImplementation((pw) => Promise.resolve(`hashed_${pw}`)),
}));

describe('UserService', () => {
  let service: UserService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateUserDto = {
      username: 'testuser',
      password: '123456',
      phone: '85999999999',
      escalacao: 2,
      situacao: 'ativo',
      setor: 'Fotografia',
      funcao: 'user',
      acompanhante: 'nao',
    };

    it('deve criar um usuário com sucesso (hash da senha)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 1,
        ...createDto,
        password: 'hashed_123456',
        createdAt: new Date(),
      });

      const result = await service.create(createDto);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(argon2.hash).toHaveBeenCalledWith('123456');
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          username: 'testuser',
          password: 'hashed_123456',
          funcao: 'user',
          situacao: 'ativo',
        }),
      });
      expect(result).toHaveProperty('id', 1);
      expect(result.password).toBe('hashed_123456');
    });

    it('deve lançar ConflictException se username já existir', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        username: 'testuser',
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Username já existe',
      );

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de usuários sem senhas', async () => {
      const mockUsers = [
        {
          id: 1,
          username: 'user1',
          phone: '85...',
          escalacao: 2,
          situacao: 'ativo',
          setor: 'A',
          funcao: 'user',
          acompanhante: 'nao',
          createdAt: new Date(),
        },
        {
          id: 2,
          username: 'admin',
          phone: null,
          escalacao: 0,
          situacao: 'ativo',
          setor: 'Admin',
          funcao: 'admin',
          acompanhante: 'nao',
          createdAt: new Date(),
        },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockUsers);
      expect(result[0]).not.toHaveProperty('password');
    });

    it('deve retornar array vazio se não houver usuários', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário pelo id (sem senha)', async () => {
      const mockUser = {
        id: 5,
        username: 'joao',
        phone: '85988888888',
        escalacao: 3,
        situacao: 'ativo',
        setor: 'Vídeo',
        funcao: 'user',
        acompanhante: 'sim',
        createdAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(5);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
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
      expect(result).toEqual(mockUser);
    });

    it('deve retornar null se usuário não existir', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = {
      phone: '85977777777',
      escalacao: 4,
      password: 'novaSenha123',
    };

    it('deve atualizar usuário e hashear senha nova se fornecida', async () => {
      mockPrisma.user.update.mockResolvedValue({
        id: 10,
        username: 'maria',
        ...updateDto,
        password: 'hashed_novaSenha123',
      });

      const result = await service.update(10, updateDto);

      expect(argon2.hash).toHaveBeenCalledWith('novaSenha123');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: expect.objectContaining({
          phone: '85977777777',
          escalacao: 4,
          password: 'hashed_novaSenha123',
        }),
      });
      expect(result.password).toBe('hashed_novaSenha123');
    });

    it('deve atualizar sem tocar na senha se não fornecida', async () => {
      const dtoSemSenha: UpdateUserDto = { phone: '85966666666' };

      mockPrisma.user.update.mockResolvedValue({
        id: 10,
        phone: '85966666666',
      });

      await service.update(10, dtoSemSenha);

      expect(argon2.hash).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ password: expect.anything() }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('deve deletar usuário pelo id', async () => {
      mockPrisma.user.delete.mockResolvedValue({ id: 7 });

      const result = await service.remove(7);

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 7 } });
      expect(result).toEqual({ id: 7 });
    });
  });
});
