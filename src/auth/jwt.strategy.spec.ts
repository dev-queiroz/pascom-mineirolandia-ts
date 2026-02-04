import { JwtStrategy } from './jwt.strategy';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test_secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should validate and return payload formatted for request if user exists', async () => {
    const payload = { sub: 1, username: 'dev-queiroz', funcao: 'admin' };

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      username: 'dev-queiroz',
    });

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      userId: 1,
      username: 'dev-queiroz',
      funcao: 'admin',
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    const payload = { sub: 99, username: 'ghost', funcao: 'user' };
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
