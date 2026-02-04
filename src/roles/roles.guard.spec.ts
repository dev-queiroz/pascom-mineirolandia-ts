import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  // Mock do ExecutionContext
  const mockContext = {
    getHandler: jest.fn(),
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn(),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if no roles are required', () => {
    // Simula que o Reflector não encontrou o decorator @Roles
    jest.spyOn(reflector, 'get').mockReturnValue(null);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should return true if user role is included in required roles', () => {
    const requiredRoles = ['admin', 'editor'];
    const mockUser = { funcao: 'admin' };

    jest.spyOn(reflector, 'get').mockReturnValue(requiredRoles);
    jest.spyOn(mockContext.switchToHttp(), 'getRequest').mockReturnValue({
      user: mockUser,
    });

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should return false if user role is not included in required roles', () => {
    const requiredRoles = ['admin'];
    const mockUser = { funcao: 'user' }; // Role diferente

    jest.spyOn(reflector, 'get').mockReturnValue(requiredRoles);
    jest.spyOn(mockContext.switchToHttp(), 'getRequest').mockReturnValue({
      user: mockUser,
    });

    const result = guard.canActivate(mockContext);
    expect(result).toBe(false);
  });
});
