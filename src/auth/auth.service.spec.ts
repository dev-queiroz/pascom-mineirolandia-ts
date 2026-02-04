import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';

// Mock do argon2
jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let jwt: JwtService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue('mock_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwt = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    const loginDto = { username: 'user_test', password: 'password123' };
    const mockUser = {
      id: 1,
      username: 'user_test',
      password: 'hashed_password',
      funcao: 'admin',
    };

    it('should throw UnauthorizedException if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciais inválidas',
      );
    });

    it('should return access_token if credentials are valid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toEqual({ access_token: 'mock_token' });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
        funcao: mockUser.funcao,
      });
    });
  });

  describe('getMe', () => {
    it('should return user data without password', async () => {
      const mockUserData = { id: 1, username: 'test' };
      mockPrisma.user.findUnique.mockResolvedValue(mockUserData);

      const result = await service.getMe(1);
      expect(result).toEqual(mockUserData);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getMe(999)).rejects.toThrow(
        'Usuário não encontrado',
      );
    });
  });
});
