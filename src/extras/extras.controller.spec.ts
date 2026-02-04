import { Test, TestingModule } from '@nestjs/testing';
import { ExtrasController } from './extras.controller';
import { ExtrasService } from './extras.service';
import { Response } from 'express';

describe('ExtrasController', () => {
  let controller: ExtrasController;
  let service: ExtrasService;

  const mockResponse = {
    set: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExtrasController],
      providers: [
        {
          provide: ExtrasService,
          useValue: {
            generateICS: jest.fn(),
            generateWhatsAppLinks: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ExtrasController>(ExtrasController);
    service = module.get<ExtrasService>(ExtrasService);
  });

  describe('generateICS', () => {
    it('should set headers and send ics content', async () => {
      const content = 'BEGIN:VCALENDAR';
      jest.spyOn(service, 'generateICS').mockResolvedValue(content);

      await controller.generateICS('1', mockResponse);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Type': 'text/calendar; charset=utf-8',
        }),
      );
      expect(mockResponse.send).toHaveBeenCalledWith(content);
    });
  });

  describe('generateWhatsAppLinks', () => {
    it('should call service with correct month', async () => {
      await controller.generateWhatsAppLinks('05');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.generateWhatsAppLinks).toHaveBeenCalledWith('05');
    });
  });
});
