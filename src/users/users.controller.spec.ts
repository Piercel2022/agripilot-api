import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

describe('UsersController', () => {
  let controller: UsersController;

  const usersService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const dto = {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@example.com',
      password: 'password123',
      organizationId: 'org-1',
    };

    usersService.create.mockResolvedValue({
      id: 'user-1',
      email: dto.email,
    });

    const result = await controller.create(dto);

    expect(usersService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      id: 'user-1',
      email: dto.email,
    });
  });

  it('should return all users', async () => {
    usersService.findAll.mockResolvedValue([]);

    await controller.findAll();

    expect(usersService.findAll).toHaveBeenCalled();
  });

  it('should return one user', async () => {
    usersService.findOne.mockResolvedValue({
      id: 'user-1',
    });

    await controller.findOne('user-1');

    expect(usersService.findOne).toHaveBeenCalledWith(
      'user-1',
    );
  });

  it('should update a user', async () => {
    const dto = {
      firstName: 'Pierre',
    };

    usersService.update.mockResolvedValue({
      id: 'user-1',
    });

    await controller.update('user-1', dto);

    expect(usersService.update).toHaveBeenCalledWith(
      'user-1',
      dto,
    );
  });

  it('should remove a user', async () => {
    usersService.remove.mockResolvedValue(undefined);

    await controller.remove('user-1');

    expect(usersService.remove).toHaveBeenCalledWith(
      'user-1',
    );
  });
});
