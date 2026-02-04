import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue({ access_token: 'token_123' }),
            getMe: jest.fn().mockResolvedValue({ id: 1, username: 'test' }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return access_token and success message', async () => {
      const loginDto = { username: 'test', password: '123' };
      const result = await controller.login(loginDto);

      expect(result).toEqual({
        access_token: 'token_123',
        success: true,
        message: 'Login realizado com sucesso',
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('getMe', () => {
    it('should call getMe with user id from request', async () => {
      const mockReq = { user: { userId: 1 } };
      const result = await controller.getMe(mockReq as any);

      expect(result).toEqual({ id: 1, username: 'test' });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getMe).toHaveBeenCalledWith(1);
    });
  });
});
