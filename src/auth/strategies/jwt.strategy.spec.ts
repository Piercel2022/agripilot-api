import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../auth.service.js';
import { JwtStrategy } from './jwt.strategy.js';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  let configService: {
    get: ReturnType<typeof vi.fn>;
  };

  let authService: {
    getCurrentUser: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    configService = {
      get: vi.fn(),
    };

    authService = {
      getCurrentUser: vi.fn(),
    };
  });

  describe('constructor', () => {
    it('should create the strategy with the configured JWT secret', () => {
      configService.get.mockReturnValue('test-jwt-secret');

      strategy = new JwtStrategy(
        configService as unknown as ConfigService,
        authService as unknown as AuthService,
      );

      expect(strategy).toBeDefined();
      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    });

    it('should throw when JWT_SECRET is not configured', () => {
      configService.get.mockReturnValue(undefined);

      expect(
        () =>
          new JwtStrategy(
            configService as unknown as ConfigService,
            authService as unknown as AuthService,
          ),
      ).toThrow('JWT_SECRET is not configured');

      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    });

    it('should throw when JWT_SECRET is an empty string', () => {
      configService.get.mockReturnValue('');

      expect(
        () =>
          new JwtStrategy(
            configService as unknown as ConfigService,
            authService as unknown as AuthService,
          ),
      ).toThrow('JWT_SECRET is not configured');
    });
  });

  describe('validate', () => {
    beforeEach(() => {
      configService.get.mockReturnValue('test-jwt-secret');

      strategy = new JwtStrategy(
        configService as unknown as ConfigService,
        authService as unknown as AuthService,
      );
    });

    it('should return the current user from the AuthService', async () => {
      const user = {
        id: 'user-1',
        firstName: 'Pierre',
        lastName: 'Moussa',
        email: 'pierre@example.com',
        role: 'member',
      };

      authService.getCurrentUser.mockResolvedValue(user);

      const payload = {
        sub: 'user-1',
        email: 'pierre@example.com',
        organizationId: 'org-1',
        role: 'member',
      };

      const result = await strategy.validate(payload);

      expect(authService.getCurrentUser).toHaveBeenCalledWith(
        'user-1',
      );

      expect(result).toBe(user);
    });

    it('should use the subject from the JWT payload', async () => {
      authService.getCurrentUser.mockResolvedValue({
        id: 'user-42',
      });

      const payload = {
        sub: 'user-42',
        email: 'other@example.com',
        organizationId: 'org-99',
        role: 'admin',
      };

      await strategy.validate(payload);

      expect(authService.getCurrentUser).toHaveBeenCalledTimes(1);
      expect(authService.getCurrentUser).toHaveBeenCalledWith(
        payload.sub,
      );
    });

    it('should propagate errors from AuthService', async () => {
      const error = new Error('User not found');

      authService.getCurrentUser.mockRejectedValue(error);

      const payload = {
        sub: 'missing-user',
        email: 'missing@example.com',
        organizationId: 'org-1',
        role: 'member',
      };

      await expect(
        strategy.validate(payload),
      ).rejects.toThrow(error);

      expect(authService.getCurrentUser).toHaveBeenCalledWith(
        'missing-user',
      );
    });
  });
});
