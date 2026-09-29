import { Test, TestingModule } from '@nestjs/testing';

import { FarmsController } from './farms.controller.js';
import { FarmsService } from './farms.service.js';

describe('FarmsController', () => {
  let controller: FarmsController;

  const farmsService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  const request = {
    user: {
      id: 'user-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@example.com',
      role: 'member',
      organization: {
        id: 'org-1',
        name: 'Ferme Demo',
        slug: 'ferme-demo',
      },
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FarmsController],
      providers: [
        {
          provide: FarmsService,
          useValue: farmsService,
        },
      ],
    }).compile();

    controller = module.get<FarmsController>(FarmsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a farm using the authenticated organization', async () => {
    const dto = {
      name: 'Ferme Test',
    };

    farmsService.create.mockResolvedValue({ id: 'farm-1' });

    const result = await controller.create(dto, request as never);

    expect(farmsService.create).toHaveBeenCalledWith(dto, 'org-1');
    expect(result).toEqual({ id: 'farm-1' });
  });

  it('should list farms for the authenticated organization', async () => {
    farmsService.findAll.mockResolvedValue([]);

    await controller.findAll(request as never);

    expect(farmsService.findAll).toHaveBeenCalledWith('org-1');
  });

  it('should find a farm for the authenticated organization', async () => {
    farmsService.findOne.mockResolvedValue({ id: 'farm-1' });

    await controller.findOne('farm-1', request as never);

    expect(farmsService.findOne).toHaveBeenCalledWith(
      'farm-1',
      'org-1',
    );
  });

  it('should update a farm for the authenticated organization', async () => {
    const dto = {
      name: 'Updated Farm',
    };

    farmsService.update.mockResolvedValue({ id: 'farm-1' });

    await controller.update(
      'farm-1',
      dto,
      request as never,
    );

    expect(farmsService.update).toHaveBeenCalledWith(
      'farm-1',
      dto,
      'org-1',
    );
  });

  it('should remove a farm for the authenticated organization', async () => {
    farmsService.remove.mockResolvedValue(undefined);

    await controller.remove('farm-1', request as never);

    expect(farmsService.remove).toHaveBeenCalledWith(
      'farm-1',
      'org-1',
    );
  });
});
