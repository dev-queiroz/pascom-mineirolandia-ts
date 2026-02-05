import { Test, TestingModule } from '@nestjs/testing';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';

describe('FinancialController', () => {
  let controller: FinancialController;
  let service: FinancialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinancialController],
      providers: [
        {
          provide: FinancialService,
          useValue: {
            createContribution: jest.fn(),
            getPendings: jest.fn(),
            confirmPendency: jest.fn(),
            deletePendency: jest.fn(),
            getSummary: jest.fn(),
            createExpense: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FinancialController>(FinancialController);
    service = module.get<FinancialService>(FinancialService);
  });

  it('should call createContribution with user id from req', async () => {
    const dto = { value: 50, date: '2026-01-01', note: 'oferta' };
    const mockFile = {} as any;
    const mockReq = { user: { userId: 99 } };

    await controller.createContribution(dto, mockFile, mockReq as any);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.createContribution).toHaveBeenCalledWith(dto, 99, mockFile);
  });

  it('should call deletePendency with numeric id', async () => {
    await controller.deletePendency('10');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.deletePendency).toHaveBeenCalledWith(10);
  });

  it('should call createExpense for admin users', async () => {
    const dto = { value: 100, date: '2026-02-05', note: 'Reforma' };
    const mockReq = { user: { userId: 1 } };

    await controller.createExpense(dto, mockReq as any);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.createExpense).toHaveBeenCalledWith(dto, 1);
  });
});
