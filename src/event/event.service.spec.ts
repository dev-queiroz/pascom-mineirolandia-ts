import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('EventService', () => {
  let service: EventService;
  let prisma: PrismaService;

  const mockPrisma = {
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
    eventSlot: {
      findFirst: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    justification: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should throw BadRequest if slots order is invalid', async () => {
      const dto = { slots: [{ order: 11, function: 'Test' }] } as any;
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequest if month or day is invalid', async () => {
      const dto = { month: '13', day: '32', slots: [] } as any;
      await expect(service.create(dto)).rejects.toThrow('Data inválida');
    });

    it('should create event successfully', async () => {
      const dto = {
        month: '05',
        day: '10',
        time: '10:00',
        description: 'Missa',
        slots: [],
      } as any;
      mockPrisma.event.create.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto);
      expect(result.id).toBe(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.event.create).toHaveBeenCalled();
    });

    it('should create event with slots mapping', async () => {
      const dto = {
        month: '05',
        day: '10',
        time: '10:00',
        description: 'Missa',
        slots: [{ function: 'Fotógrafo', order: 1 }],
      } as any;

      mockPrisma.event.create.mockResolvedValue({ id: 1, ...dto });

      await service.create(dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slots: {
              create: [{ function: 'Fotógrafo', order: 1 }],
            },
          }),
        }),
      );
    });
  });

  describe('assignSlot', () => {
    it('should throw if slot not found or occupied', async () => {
      mockPrisma.eventSlot.findFirst.mockResolvedValue(null);
      await expect(service.assignSlot(1, 1, 1)).rejects.toThrow(
        'Slot não encontrado',
      );
    });

    it('should throw if slot is for acompanhante and user is not enabled', async () => {
      mockPrisma.eventSlot.findFirst.mockResolvedValue({
        id: 1,
        function: 'Acompanhante de Transmissão',
        event: { month: '05', day: '10' },
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        escalacao: 5,
        acompanhante: 'nao', // Usuário não habilitado
      });
      mockPrisma.eventSlot.count.mockResolvedValue(0);
      mockPrisma.event.findFirst.mockResolvedValue(null);

      await expect(service.assignSlot(1, 1, 1)).rejects.toThrow(
        'Usuário não habilitado para Acompanhante',
      );
    });

    it('should throw if monthly limit reached', async () => {
      mockPrisma.eventSlot.findFirst.mockResolvedValue({
        id: 1,
        event: { month: '05' },
      });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, escalacao: 2 });
      mockPrisma.eventSlot.count.mockResolvedValue(2);

      await expect(service.assignSlot(1, 1, 1)).rejects.toThrow(
        /Limite mensal/,
      );
    });

    it('should throw if user already assigned on same day', async () => {
      mockPrisma.eventSlot.findFirst.mockResolvedValue({
        id: 1,
        event: { month: '05', day: '10' },
      });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, escalacao: 5 });
      mockPrisma.eventSlot.count.mockResolvedValue(0);
      mockPrisma.event.findFirst.mockResolvedValue({ id: 2 }); // Evento no mesmo dia

      await expect(service.assignSlot(1, 1, 1)).rejects.toThrow(
        'Usuário já escalado no mesmo dia',
      );
    });
  });

  describe('update', () => {
    const eventId = 1;
    const mockExistingEvent = {
      id: eventId,
      month: '05',
      slots: [{ id: 10, function: 'Foto', order: 1 }],
    };

    it('should throw NotFoundException if event does not exist', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);
      await expect(service.update(eventId, {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update event basics when no slots are provided', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(mockExistingEvent);
      const dto = { description: 'Nova Descrição' };

      await service.update(eventId, dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.event.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ slots: expect.anything() }),
        }),
      );
    });

    it('should perform complex upsert and delete of slots', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(mockExistingEvent);
      const dto = {
        slots: [
          { id: 10, function: 'Foto Atualizada', order: 1 }, // Update
          { id: 0, function: 'Novo Slot', order: 2 }, // Create (id 0 ou undefined)
        ],
      };

      await service.update(eventId, dto);

      // Verifica se o deleteMany foi chamado para remover slots antigos que não estão no DTO
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.event.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slots: expect.objectContaining({
              deleteMany: { id: { notIn: [10] } },
              upsert: expect.arrayContaining([
                expect.objectContaining({ where: { id: 10 } }),
                expect.objectContaining({ where: { id: 0 } }),
              ]),
            }),
          }),
        }),
      );
    });
  });

  describe('removeSlot', () => {
    it('should throw if justification is empty', async () => {
      await expect(service.removeSlot(1, 1, 1, '   ')).rejects.toThrow(
        'Justificativa obrigatória',
      );
    });

    it('should create justification and update slot', async () => {
      mockPrisma.eventSlot.findFirst.mockResolvedValue({ id: 10 });

      await service.removeSlot(1, 1, 1, 'Motivo de força maior');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.justification.create).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.eventSlot.updateMany).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if event to remove does not exist', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });

    it('should delete event successfully', async () => {
      mockPrisma.event.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.event.delete.mockResolvedValue({ id: 1 });

      await service.remove(1);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.event.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
