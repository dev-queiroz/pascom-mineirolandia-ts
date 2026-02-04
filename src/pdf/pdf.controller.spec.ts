import { Test, TestingModule } from '@nestjs/testing';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { Response } from 'express';

describe('PdfController', () => {
  let controller: PdfController;
  let service: PdfService;

  const mockResponse = {
    setHeader: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdfController],
      providers: [
        {
          provide: PdfService,
          useValue: {
            generateMonthlyScalePDF: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PdfController>(PdfController);
    service = module.get<PdfService>(PdfService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateScale', () => {
    it('should set correct headers and call pdfService', async () => {
      const month = '05';
      const generateSpy = jest.spyOn(service, 'generateMonthlyScalePDF');

      await controller.generateScale(month, mockResponse);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/pdf',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        `attachment; filename=escala-${month}.pdf`,
      );

      // Verifica se o serviço foi chamado com o mês e o objeto response
      expect(generateSpy).toHaveBeenCalledWith(month, mockResponse);
    });
  });
});
