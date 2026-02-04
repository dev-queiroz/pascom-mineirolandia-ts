import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';

describe('EventController', () => {
  let controller: EventController;
  let service: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            assignSlot: jest.fn(),
            removeSlot: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
    service = module.get<EventService>(EventService);
  });

  it('should call findAll with month query', async () => {
    await controller.findAll('05');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.findAll).toHaveBeenCalledWith('05');
  });

  it('should call assignSlot with user id from request', async () => {
    const mockReq = { user: { userId: 123 } };
    await controller.assignSlot('1', 5, mockReq as any);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.assignSlot).toHaveBeenCalledWith(1, 5, 123);
  });

  it('should call removeSlot with body data', async () => {
    const mockReq = { user: { userId: 123 } };
    const body = { slotOrder: 2, justification: 'Cansado' };
    await controller.removeSlot('1', body, mockReq as any);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.removeSlot).toHaveBeenCalledWith(1, 2, 123, 'Cansado');
  });
});
