import { Test, TestingModule } from '@nestjs/testing';
import { FinancialService } from './financial.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { BadRequestException } from '@nestjs/common';

describe('FinancialService', () => {
  let service: FinancialService;
  let prisma: PrismaService;
  let cloudinary: CloudinaryService;

  const mockPrisma = {
    financial: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  const mockCloudinary = {
    uploadImage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CloudinaryService, useValue: mockCloudinary },
      ],
    }).compile();

    service = module.get<FinancialService>(FinancialService);
    prisma = module.get<PrismaService>(PrismaService);
    cloudinary = module.get<CloudinaryService>(CloudinaryService);
  });

  describe('createContribution', () => {
    const dto = { value: 100, date: '2026-01-01', note: 'Teste' };
    const userId = 1;

    it('should throw BadRequestException if value <= 0', async () => {
      await expect(
        service.createContribution({ ...dto, value: 0 }, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should upload file and create record if file is provided', async () => {
      const mockFile = { buffer: Buffer.from('test') } as any;
      mockCloudinary.uploadImage.mockResolvedValue({
        secure_url: 'http://cloud.url',
      });

      await service.createContribution(dto, userId, mockFile);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(cloudinary.uploadImage).toHaveBeenCalledWith(mockFile);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.financial.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ receipt: 'http://cloud.url' }),
        }),
      );
    });
  });

  describe('getPendings', () => {
    it('should filter by userId if user is not admin', async () => {
      const user = { userId: 5, username: 'user', funcao: 'membro' };
      await service.getPendings(user);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.financial.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'pendente', userId: 5 },
        }),
      );
    });

    it('should not filter by userId if user is admin', async () => {
      const user = { userId: 1, username: 'admin', funcao: 'admin' };
      await service.getPendings(user);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.financial.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'pendente' },
        }),
      );
    });
  });

  describe('getSummary', () => {
    it('should throw error for invalid month format', async () => {
      await expect(service.getSummary('26-01')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should calculate balance correctly', async () => {
      const mockStats = [
        { type: 'entrada', _sum: { value: 1000 } },
        { type: 'saida', _sum: { value: 400 } },
      ];
      mockPrisma.financial.groupBy.mockResolvedValue(mockStats);

      const result = await service.getSummary('2026-01');
      expect(result).toEqual({ entradas: 1000, saidas: 400, saldo: 600 });
    });
  });

  describe('createExpense', () => {
    it('should throw BadRequestException if expense value is negative', async () => {
      const dto = { value: -10, date: '2026-02-05', note: 'Luz' };
      await expect(service.createExpense(dto, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create an expense with status confirmado', async () => {
      const dto = { value: 50, date: '2026-02-05', note: 'Água' };
      await service.createExpense(dto, 1);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.financial.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'saida',
            status: 'confirmado',
            value: 50,
          }),
        }),
      );
    });
  });
});
