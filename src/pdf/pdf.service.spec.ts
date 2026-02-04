import { Test, TestingModule } from '@nestjs/testing';
import { PdfService } from './pdf.service';
import * as fs from 'fs';

jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    existsSync: jest.fn(),
  };
});

import { PrismaService } from '../prisma/prisma.service';

jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    pipe: jest.fn().mockReturnThis(),
    image: jest.fn().mockReturnThis(),
    fillColor: jest.fn().mockReturnThis(),
    font: jest.fn().mockReturnThis(),
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    strokeColor: jest.fn().mockReturnThis(),
    lineWidth: jest.fn().mockReturnThis(),
    moveTo: jest.fn().mockReturnThis(),
    lineTo: jest.fn().mockReturnThis(),
    stroke: jest.fn().mockReturnThis(),
    rect: jest.fn().mockReturnThis(),
    fill: jest.fn().mockReturnThis(),
    addPage: jest.fn().mockReturnThis(),
    bufferedPageRange: jest.fn().mockReturnValue({ start: 0, count: 1 }),
    switchToPage: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    page: { height: 800 },
    y: 100,
  }));
});

describe('PdfService', () => {
  let service: PdfService;
  let prisma: PrismaService;

  const mockResponse = {
    pipe: jest.fn(),
    on: jest.fn(),
    emit: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfService,
        {
          provide: PrismaService,
          useValue: {
            event: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PdfService>(PdfService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should generate PDF successfully when data exists', async () => {
    const mockEvents = [
      {
        day: '01',
        month: '05',
        description: 'Missa',
        location: 'Matriz',
        time: '19:00',
        slots: [{ order: 1, function: 'Foto', user: { username: 'Joao' } }],
      },
    ];

    (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

    const fsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);

    await service.generateMonthlyScalePDF('05', mockResponse);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prisma.event.findMany).toHaveBeenCalled();
    expect(fsSpy).toHaveBeenCalled();
  });

  it('should handle pagination when events exist', async () => {
    const mockEvents = Array(5).fill({
      day: '01',
      month: '05',
      description: 'Evento Teste',
      time: '10:00',
      slots: [],
    });

    (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);

    await service.generateMonthlyScalePDF('05', mockResponse);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prisma.event.findMany).toHaveBeenCalled();
  });
});
