import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getAdminDashboard: jest.fn().mockResolvedValue({ ok: true }),
          },
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  it('should call service with month query', async () => {
    const result = await controller.getDashboard('05');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.getAdminDashboard).toHaveBeenCalledWith('05');
    expect(result).toEqual({ ok: true });
  });
});
