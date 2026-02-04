import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            check: jest.fn().mockReturnValue({ status: 'ok' }),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should call healthService.check and return its result', () => {
    const result = controller.checkHealth();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.check).toHaveBeenCalled();
    expect(result).toEqual({ status: 'ok' });
  });
});
