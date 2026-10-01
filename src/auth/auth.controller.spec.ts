import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;

  let authService: {
    register: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authService = {
      register: vi.fn(),
      login: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should delegate registration to AuthService', async () => {
      const registerDto = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123',
        organizationId: 'org-1',
      };

      const response = {
        user: {
          id: 'user-1',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean@example.com',
          role: 'member',
        },
      };

      authService.register.mockResolvedValue(response);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toBe(response);
    });

    it('should propagate registration errors', async () => {
      const error = new Error('Email already exists');

      authService.register.mockRejectedValue(error);

      await expect(
        controller.register({
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean@example.com',
          password: 'password123',
          organizationId: 'org-1',
        }),
      ).rejects.toThrow(error);
    });
  });

  describe('login', () => {
    it('should delegate login to AuthService', async () => {
      const loginDto = {
        email: 'pierre@example.com',
        password: 'password123',
      };

      const response = {
        accessToken: 'jwt-access-token',
        tokenType: 'Bearer',
        user: {
          id: 'user-1',
          email: 'pierre@example.com',
          role: 'member',
        },
      };

      authService.login.mockResolvedValue(response);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toBe(response);
    });

    it('should propagate login errors', async () => {
      const error = new Error('Invalid credentials');

      authService.login.mockRejectedValue(error);

      await expect(
        controller.login({
          email: 'pierre@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(error);
    });
  });

  describe('me', () => {
    it('should return the authenticated user from the request', () => {
      const user = {
        id: 'user-1',
        firstName: 'Pierre',
        lastName: 'Moussa',
        email: 'pierre@example.com',
        role: 'member',
      };

      const request = {
        user,
      } as never;

      const result = controller.me(request);

      expect(result).toBe(user);
    });
  });
});
