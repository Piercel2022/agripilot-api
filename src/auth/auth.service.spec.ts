import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

vi.mock('bcrypt', () => ({
  compare: vi.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  let usersRepository: {
    createQueryBuilder: ReturnType<typeof vi.fn>;
  };

  let usersService: {
    create: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  let jwtService: {
    signAsync: ReturnType<typeof vi.fn>;
  };

  const organization = {
    id: 'org-1',
    name: 'Ferme Démo Agripilot',
  };

  const user = {
    id: 'user-1',
    firstName: 'Pierre',
    lastName: 'Moussa',
    email: 'pierre@example.com',
    passwordHash: '$2b$10$hashed-password',
    role: 'member',
    organization,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
  } as unknown as User;

  beforeEach(() => {
    vi.clearAllMocks();

    usersRepository = {
      createQueryBuilder: vi.fn(),
    };

    usersService = {
      create: vi.fn(),
      findOne: vi.fn(),
    };

    jwtService = {
      signAsync: vi.fn(),
    };

    service = new AuthService(
      usersRepository as unknown as Repository<User>,
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
    );
  });

  describe('register', () => {
    it('should create a member user through UsersService', async () => {
      const createdUser = {
        id: 'user-2',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        role: 'member',
      };

      usersService.create.mockResolvedValue(createdUser);

      const registerDto = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123',
        organizationId: 'org-1',
      };

      const result = await service.register(registerDto);

      expect(usersService.create).toHaveBeenCalledWith({
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        email: registerDto.email,
        password: registerDto.password,
        organizationId: registerDto.organizationId,
        role: 'member',
      });

      expect(result).toEqual({
        user: createdUser,
      });
    });

    it('should propagate registration errors from UsersService', async () => {
      const error = new Error('Email already exists');

      usersService.create.mockRejectedValue(error);

      const registerDto = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123',
        organizationId: 'org-1',
      };

      await expect(
        service.register(registerDto),
      ).rejects.toThrow(error);

      expect(usersService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    function mockQueryBuilder(result: User | null) {
      const queryBuilder = {
        addSelect: vi.fn(),
        leftJoinAndSelect: vi.fn(),
        where: vi.fn(),
        getOne: vi.fn(),
      };

      queryBuilder.addSelect.mockReturnValue(queryBuilder);
      queryBuilder.leftJoinAndSelect.mockReturnValue(queryBuilder);
      queryBuilder.where.mockReturnValue(queryBuilder);
      queryBuilder.getOne.mockResolvedValue(result);

      usersRepository.createQueryBuilder.mockReturnValue(
        queryBuilder,
      );

      return queryBuilder;
    }

    it('should reject an unknown user', async () => {
      const queryBuilder = mockQueryBuilder(null);

      await expect(
        service.login({
          email: 'unknown@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(
        usersRepository.createQueryBuilder,
      ).toHaveBeenCalledWith('user');

      expect(queryBuilder.addSelect).toHaveBeenCalledWith(
        'user.passwordHash',
      );

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'user.organization',
        'organization',
      );

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'user.email = :email',
        {
          email: 'unknown@example.com',
        },
      );

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should reject an invalid password', async () => {
      const queryBuilder = mockQueryBuilder(user);

      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({
          email: user.email,
          password: 'wrong-password',
        }),
      ).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrong-password',
        user.passwordHash,
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should generate an access token and return the public user data', async () => {
      const queryBuilder = mockQueryBuilder(user);

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      jwtService.signAsync.mockResolvedValue(
        'jwt-access-token',
      );

      const result = await service.login({
        email: user.email,
        password: 'correct-password',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'correct-password',
        user.passwordHash,
      );

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        organizationId: user.organization.id,
        role: user.role,
      });

      expect(result).toEqual({
        accessToken: 'jwt-access-token',
        tokenType: 'Bearer',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          organization: user.organization,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });

      expect(queryBuilder.getOne).toHaveBeenCalledTimes(1);
    });

    it('should use the submitted email when querying the user', async () => {
      const queryBuilder = mockQueryBuilder(user);

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      jwtService.signAsync.mockResolvedValue(
        'jwt-access-token',
      );

      await service.login({
        email: 'pierre@example.com',
        password: 'correct-password',
      });

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'user.email = :email',
        {
          email: 'pierre@example.com',
        },
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should delegate to UsersService.findOne', async () => {
      usersService.findOne.mockResolvedValue(user);

      const result = await service.getCurrentUser(
        'user-1',
      );

      expect(usersService.findOne).toHaveBeenCalledWith(
        'user-1',
      );

      expect(result).toBe(user);
    });

    it('should propagate errors from UsersService.findOne', async () => {
      const error = new Error('User not found');

      usersService.findOne.mockRejectedValue(error);

      await expect(
        service.getCurrentUser('missing-user'),
      ).rejects.toThrow(error);

      expect(usersService.findOne).toHaveBeenCalledWith(
        'missing-user',
      );
    });
  });
});
