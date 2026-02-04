import { Test, TestingModule } from '@nestjs/testing';
import { ExtrasService } from './extras.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import * as ics from 'ics';

jest.mock('ics', () => ({
  createEvent: jest.fn(),
}));

describe('ExtrasService', () => {
  let service: ExtrasService;

  const mockPrisma = {
    event: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExtrasService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ExtrasService>(ExtrasService);
  });

  describe('generateICS', () => {
    const mockEvent = {
      id: 1,
      month: '05',
      day: '15',
      time: '19:30',
      description: 'Missa',
      location: 'Matriz',
      slots: [{}, {}],
    };

    it('should throw BadRequestException if event not found', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);
      await expect(service.generateICS(999)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return ics string on success', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
      (ics.createEvent as jest.Mock).mockReturnValue({
        value: 'BEGIN:VCALENDAR...',
      });

      const result = await service.generateICS(1);

      expect(result).toBe('BEGIN:VCALENDAR...');
      expect(ics.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          start: [2026, 5, 15, 19, 30],
          title: expect.stringContaining('Missa'),
        }),
      );
    });

    it('should throw BadRequestException if ics generation fails', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
      (ics.createEvent as jest.Mock).mockReturnValue({
        error: new Error('ICS Error'),
      });

      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(service.generateICS(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateWhatsAppLinks', () => {
    it('should return an array of encoded whatsapp links', async () => {
      const mockEvents = [
        {
          description: 'Evento 1',
          location: 'Local 1',
          day: '10',
          time: '08:00',
        },
      ];
      mockPrisma.event.findMany.mockResolvedValue(mockEvents);

      const result = await service.generateWhatsAppLinks('05');

      expect(result).toHaveLength(1);
      expect(result[0]).toContain('https://wa.me/?text=');
      expect(result[0]).toContain(encodeURIComponent('Evento 1'));
    });
  });
});
