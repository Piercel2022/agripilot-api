import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { CreateCropDto } from './dto/create-crop.dto.js';
import { UpdateCropDto } from './dto/update-crop.dto.js';
import { CropsController } from './crops.controller.js';
import { CropsService } from './crops.service.js';

describe('CropsController', () => {
  let controller: CropsController;

  let cropsService: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  const organizationId = 'org-1';

  const request = {
    user: {
      id: 'user-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@agripilot.test',
      role: 'member',
      organization: {
        id: organizationId,
        name: 'Ferme Démo Agripilot',
        slug: 'agripilot-demo',
      },
    },
  } as never;

  beforeEach(async () => {
    cropsService = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [CropsController],
        providers: [
          {
            provide: CropsService,
            useValue: cropsService,
          },
        ],
      }).compile();

    controller =
      module.get<CropsController>(CropsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a crop with the authenticated organization', async () => {
    const dto: CreateCropDto = {
      name: 'Blé tendre',
      variety: 'Chevignon',
      season: '2026',
      fieldId: 'field-1',
    };

    const crop = {
      id: 'crop-1',
      name: 'Blé tendre',
    };

    cropsService.create.mockResolvedValue(crop);

    const result = await controller.create(
      dto,
      request,
    );

    expect(cropsService.create).toHaveBeenCalledWith(
      dto,
      organizationId,
    );

    expect(result).toEqual(crop);
  });

  it('should return all crops for the authenticated organization', async () => {
    const crops = [
      {
        id: 'crop-1',
        name: 'Blé tendre',
      },
    ];

    cropsService.findAll.mockResolvedValue(crops);

    const result = await controller.findAll(request);

    expect(cropsService.findAll).toHaveBeenCalledWith(
      organizationId,
    );

    expect(result).toEqual(crops);
  });

  it('should return one crop for the authenticated organization', async () => {
    const crop = {
      id: 'crop-1',
      name: 'Blé tendre',
    };

    cropsService.findOne.mockResolvedValue(crop);

    const result = await controller.findOne(
      'crop-1',
      request,
    );

    expect(cropsService.findOne).toHaveBeenCalledWith(
      'crop-1',
      organizationId,
    );

    expect(result).toEqual(crop);
  });

  it('should update a crop with the authenticated organization', async () => {
    const dto: UpdateCropDto = {
      name: 'Maïs',
    };

    const crop = {
      id: 'crop-1',
      name: 'Maïs',
    };

    cropsService.update.mockResolvedValue(crop);

    const result = await controller.update(
      'crop-1',
      dto,
      request,
    );

    expect(cropsService.update).toHaveBeenCalledWith(
      'crop-1',
      dto,
      organizationId,
    );

    expect(result).toEqual(crop);
  });

  it('should remove a crop with the authenticated organization', async () => {
    cropsService.remove.mockResolvedValue(undefined);

    const result = await controller.remove(
      'crop-1',
      request,
    );

    expect(cropsService.remove).toHaveBeenCalledWith(
      'crop-1',
      organizationId,
    );

    expect(result).toBeUndefined();
  });
});
