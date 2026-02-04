import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: Partial<UserService>;

  beforeEach(async () => {
    mockUserService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar service.create', async () => {
      const dto: CreateUserDto = {
        username: 'test',
        password: '123',
        phone: '85',
      } as any;
      await controller.create(dto);
      expect(mockUserService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('deve chamar service.findAll', async () => {
      await controller.findAll();
      expect(mockUserService.findAll).toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('deve retornar req.user', () => {
      const req = { user: { id: 1, username: 'admin' } };
      const result = controller.getMe(req as any);
      expect(result).toEqual(req.user);
    });
  });

  describe('findOne', () => {
    it('deve chamar service.findOne com id numérico', async () => {
      await controller.findOne('5');
      expect(mockUserService.findOne).toHaveBeenCalledWith(5);
    });
  });

  describe('update', () => {
    it('deve chamar service.update com id numérico e dto', async () => {
      const dto = { phone: '999999999' } as any;
      await controller.update('3', dto);
      expect(mockUserService.update).toHaveBeenCalledWith(3, dto);
    });
  });

  describe('remove', () => {
    it('deve chamar service.remove com id numérico', async () => {
      await controller.remove('7');
      expect(mockUserService.remove).toHaveBeenCalledWith(7);
    });
  });
});
