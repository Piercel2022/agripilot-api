import { Test, TestingModule } from '@nestjs/testing';

import { HarvestsController } from './harvests.controller.js';
import { HarvestsService } from './harvests.service.js';

describe('HarvestsController', () => {
  let controller: HarvestsController;

  const harvestsService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  const request = {
    user: {
      id: 'user-id',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@agripilot.test',
      role: 'member',
      organization: {
        id: 'organization-id',
        name: 'Ferme Démo Agripilot',
        slug: 'agripilot-demo',
      },
    },
  } as any;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [HarvestsController],
        providers: [
          {
            provide: HarvestsService,
            useValue: harvestsService,
          },
        ],
      }).compile();

    controller =
      module.get<HarvestsController>(
        HarvestsController,
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a harvest', async () => {
    const dto = {
      cropId: 'crop-id',
      campaignId: 'campaign-id',
      harvestDate: '2027-07-15',
      quantity: 12500,
      unit: 'kg',
      yield: 10,
      quality: 'Bonne',
      notes: 'Récolte principale',
    };

    const expected = {
      id: 'harvest-id',
      ...dto,
    };

    harvestsService.create.mockResolvedValue(expected);

    await expect(
      controller.create(dto, request),
    ).resolves.toEqual(expected);

    expect(harvestsService.create).toHaveBeenCalledWith(
      dto,
      'organization-id',
    );
  });

  it('should return all harvests', async () => {
    const expected = [
      {
        id: 'harvest-id',
        quantity: 12500,
        unit: 'kg',
      },
    ];

    harvestsService.findAll.mockResolvedValue(expected);

    await expect(
      controller.findAll(
        undefined,
        undefined,
        request,
      ),
    ).resolves.toEqual(expected);

    expect(harvestsService.findAll).toHaveBeenCalledWith(
      'organization-id',
      undefined,
      undefined,
    );
  });

  it('should return filtered harvests', async () => {
    const expected = [
      {
        id: 'harvest-id',
        cropId: 'crop-id',
        campaignId: 'campaign-id',
      },
    ];

    harvestsService.findAll.mockResolvedValue(expected);

    await expect(
      controller.findAll(
        'crop-id',
        'campaign-id',
        request,
      ),
    ).resolves.toEqual(expected);

    expect(harvestsService.findAll).toHaveBeenCalledWith(
      'organization-id',
      'crop-id',
      'campaign-id',
    );
  });

  it('should return one harvest', async () => {
    const expected = {
      id: 'harvest-id',
      quantity: 12500,
      unit: 'kg',
    };

    harvestsService.findOne.mockResolvedValue(expected);

    await expect(
      controller.findOne(
        'harvest-id',
        request,
      ),
    ).resolves.toEqual(expected);

    expect(harvestsService.findOne).toHaveBeenCalledWith(
      'harvest-id',
      'organization-id',
    );
  });

  it('should update a harvest', async () => {
    const dto = {
      quantity: 14000,
      quality: 'Très bonne',
    };

    const expected = {
      id: 'harvest-id',
      quantity: 14000,
      quality: 'Très bonne',
    };

    harvestsService.update.mockResolvedValue(expected);

    await expect(
      controller.update(
        'harvest-id',
        dto,
        request,
      ),
    ).resolves.toEqual(expected);

    expect(harvestsService.update).toHaveBeenCalledWith(
      'harvest-id',
      dto,
      'organization-id',
    );
  });

  it('should remove a harvest', async () => {
    harvestsService.remove.mockResolvedValue(undefined);

    await expect(
      controller.remove(
        'harvest-id',
        request,
      ),
    ).resolves.toBeUndefined();

    expect(harvestsService.remove).toHaveBeenCalledWith(
      'harvest-id',
      'organization-id',
    );
  });
});
