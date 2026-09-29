import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Organization } from '../organizations/entities/organization.entity.js';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;

  const usersRepository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    remove: vi.fn(),
  };

  const organizationsRepository = {
    findOne: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
        {
          provide: getRepositoryToken(Organization),
          useValue: organizationsRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user without exposing the password hash', async () => {
      const organization = {
        id: 'org-1',
        name: 'Ferme Demo',
      } as Organization;

      const dto = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123',
        organizationId: 'org-1',
        role: 'member',
      };

      const user = {
        id: 'user-1',
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash: 'hashed-password',
        role: 'member',
        organization,
      } as User;

      organizationsRepository.findOne.mockResolvedValue(organization);
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockReturnValue(user);
      usersRepository.save.mockResolvedValue(user);

      const result = await service.create(dto);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toMatchObject({
        id: 'user-1',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        role: 'member',
        organization,
      });

      expect(usersRepository.save).toHaveBeenCalled();
    });

    it('should reject creation when organization does not exist', async () => {
      organizationsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean@example.com',
          password: 'password123',
          organizationId: 'missing-org',
        }),
      ).rejects.toThrow(
        new NotFoundException('Organization not found'),
      );

      expect(usersRepository.create).not.toHaveBeenCalled();
      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it('should reject duplicate email addresses', async () => {
      const organization = {
        id: 'org-1',
      } as Organization;

      const existingUser = {
        id: 'user-1',
        email: 'jean@example.com',
      } as User;

      organizationsRepository.findOne.mockResolvedValue(organization);
      usersRepository.findOne.mockResolvedValue(existingUser);

      await expect(
        service.create({
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean@example.com',
          password: 'password123',
          organizationId: 'org-1',
        }),
      ).rejects.toThrow(
        new ConflictException('Email already exists'),
      );

      expect(usersRepository.create).not.toHaveBeenCalled();
      expect(usersRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return users without password hashes', async () => {
      const users = [
        {
          id: 'user-1',
          email: 'jean@example.com',
          passwordHash: 'secret',
        },
      ] as User[];

      usersRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(usersRepository.find).toHaveBeenCalledWith({
        relations: {
          organization: true,
        },
      });

      expect(result[0]).not.toHaveProperty('passwordHash');
      expect(result[0]).toMatchObject({
        id: 'user-1',
        email: 'jean@example.com',
      });
    });
  });

  describe('findOne', () => {
    it('should return a user without password hash', async () => {
      const user = {
        id: 'user-1',
        email: 'jean@example.com',
        passwordHash: 'secret',
      } as User;

      usersRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne('user-1');

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toMatchObject({
        id: 'user-1',
        email: 'jean@example.com',
      });
    });

    it('should throw when user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('missing-user'),
      ).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const user = {
        id: 'user-1',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        role: 'member',
        passwordHash: 'old-hash',
      } as User;

      usersRepository.findOne.mockResolvedValue(user);
      usersRepository.save.mockResolvedValue({
        ...user,
        firstName: 'Pierre',
      });

      const result = await service.update('user-1', {
        firstName: 'Pierre',
      });

      expect(user.firstName).toBe('Pierre');
      expect(usersRepository.save).toHaveBeenCalledWith(user);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should reject a duplicate email during update', async () => {
      const user = {
        id: 'user-1',
        email: 'jean@example.com',
      } as User;

      const existingUser = {
        id: 'user-2',
        email: 'pierre@example.com',
      } as User;

      usersRepository.findOne
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(existingUser);

      await expect(
        service.update('user-1', {
          email: 'pierre@example.com',
        }),
      ).rejects.toThrow(
        new ConflictException('Email already exists'),
      );

      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it('should reject update when user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('missing-user', {
          firstName: 'Pierre',
        }),
      ).rejects.toThrow(
        new NotFoundException('User not found'),
      );

      expect(usersRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an existing user', async () => {
      const user = {
        id: 'user-1',
        email: 'jean@example.com',
      } as User;

      usersRepository.findOne.mockResolvedValue(user);
      usersRepository.remove.mockResolvedValue(user);

      await service.remove('user-1');

      expect(usersRepository.remove).toHaveBeenCalledWith(user);
    });

    it('should reject removal when user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('missing-user'),
      ).rejects.toThrow(
        new NotFoundException('User not found'),
      );

      expect(usersRepository.remove).not.toHaveBeenCalled();
    });
  });
});
