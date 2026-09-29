import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { Field } from '../fields/entities/field.entity.js';
import { CreateCropDto } from './dto/create-crop.dto.js';
import { UpdateCropDto } from './dto/update-crop.dto.js';
import { Crop, CropStatus } from './entities/crop.entity.js';
import { CropsService } from './crops.service.js';

describe('CropsService', () => {
  let service: CropsService;

  let cropsRepository: {
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  let fieldsRepository: {
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    cropsRepository = {
      create: vi.fn(),
      save: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      remove: vi.fn(),
    };

    fieldsRepository = {
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CropsService,
        {
          provide: getRepositoryToken(Crop),
          useValue: cropsRepository,
        },
        {
          provide: getRepositoryToken(Field),
          useValue: fieldsRepository,
        },
      ],
    }).compile();

    service = module.get<CropsService>(CropsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a crop for a field belonging to the organization', async () => {
    const organizationId = 'org-1';

    const field = {
      id: 'field-1',
      name: 'Parcelle Nord',
    } as Field;

    const dto: CreateCropDto = {
      name: 'Blé tendre',
      variety: 'Chevignon',
      season: '2026',
      sowingDate: '2026-10-15',
      harvestDate: '2027-07-15',
      status: CropStatus.ACTIVE,
      notes: 'Culture principale',
      fieldId: 'field-1',
    };

    const crop = {
      id: 'crop-1',
      ...dto,
      field,
    } as unknown as Crop;

    fieldsRepository.findOne.mockResolvedValue(field);
    cropsRepository.create.mockReturnValue(crop);
    cropsRepository.save.mockResolvedValue(crop);

    const result = await service.create(dto, organizationId);

    expect(fieldsRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 'field-1',
        farm: {
          organization: {
            id: organizationId,
          },
        },
      },
      relations: {
        farm: true,
      },
    });

    expect(cropsRepository.create).toHaveBeenCalledWith({
      name: dto.name,
      variety: dto.variety,
      season: dto.season,
      sowingDate: dto.sowingDate,
      harvestDate: dto.harvestDate,
      status: dto.status,
      notes: dto.notes,
      field,
    });

    expect(cropsRepository.save).toHaveBeenCalledWith(crop);
    expect(result).toEqual(crop);
  });

  it('should throw when creating a crop for a field that does not exist', async () => {
    const dto: CreateCropDto = {
      name: 'Blé tendre',
      fieldId: 'missing-field',
    };

    fieldsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create(dto, 'org-1'),
    ).rejects.toThrow(
      new NotFoundException('Field not found'),
    );

    expect(cropsRepository.create).not.toHaveBeenCalled();
    expect(cropsRepository.save).not.toHaveBeenCalled();
  });

  it('should reject creating a crop for a field from another organization', async () => {
    const dto: CreateCropDto = {
      name: 'Maïs',
      fieldId: 'foreign-field',
    };

    fieldsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create(dto, 'org-1'),
    ).rejects.toThrow(
      new NotFoundException('Field not found'),
    );

    expect(fieldsRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 'foreign-field',
        farm: {
          organization: {
            id: 'org-1',
          },
        },
      },
      relations: {
        farm: true,
      },
    });
  });

  it('should return all crops for the organization', async () => {
    const crops = [
      {
        id: 'crop-1',
        name: 'Blé tendre',
      },
      {
        id: 'crop-2',
        name: 'Maïs',
      },
    ] as unknown as Crop[];

    cropsRepository.find.mockResolvedValue(crops);

    const result = await service.findAll('org-1');

    expect(cropsRepository.find).toHaveBeenCalledWith({
      where: {
        field: {
          farm: {
            organization: {
              id: 'org-1',
            },
          },
        },
      },
      relations: {
        field: {
          farm: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    expect(result).toEqual(crops);
  });

  it('should return one crop for the organization', async () => {
    const crop = {
      id: 'crop-1',
      name: 'Blé tendre',
    } as unknown as Crop;

    cropsRepository.findOne.mockResolvedValue(crop);

    const result = await service.findOne(
      'crop-1',
      'org-1',
    );

    expect(cropsRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 'crop-1',
        field: {
          farm: {
            organization: {
              id: 'org-1',
            },
          },
        },
      },
      relations: {
        field: {
          farm: true,
        },
      },
    });

    expect(result).toEqual(crop);
  });

  it('should throw when crop does not exist or belongs to another organization', async () => {
    cropsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.findOne('crop-1', 'org-1'),
    ).rejects.toThrow(
      new NotFoundException('Crop not found'),
    );

    expect(cropsRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 'crop-1',
        field: {
          farm: {
            organization: {
              id: 'org-1',
            },
          },
        },
      },
      relations: {
        field: {
          farm: true,
        },
      },
    });
  });

  it('should update a crop belonging to the organization', async () => {
    const crop = {
      id: 'crop-1',
      name: 'Blé tendre',
      variety: 'Chevignon',
      season: '2026',
      sowingDate: '2026-10-15',
      harvestDate: '2027-07-15',
      status: CropStatus.ACTIVE,
      notes: 'Ancienne note',
    } as unknown as Crop;

    const dto: UpdateCropDto = {
      name: 'Blé tendre amélioré',
      variety: 'Apache',
      status: CropStatus.HARVESTED,
      notes: 'Récolte terminée',
    };

    const updatedCrop = {
      ...crop,
      ...dto,
    } as unknown as Crop;

    cropsRepository.findOne.mockResolvedValue(crop);
    cropsRepository.save.mockResolvedValue(updatedCrop);

    const result = await service.update(
      'crop-1',
      dto,
      'org-1',
    );

    expect(crop.name).toBe('Blé tendre amélioré');
    expect(crop.variety).toBe('Apache');
    expect(crop.status).toBe(CropStatus.HARVESTED);
    expect(crop.notes).toBe('Récolte terminée');

    expect(cropsRepository.save).toHaveBeenCalledWith(crop);
    expect(result).toEqual(updatedCrop);
  });

  it('should reject updating a crop from another organization', async () => {
    const dto: UpdateCropDto = {
      name: 'Modification interdite',
    };

    cropsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update(
        'foreign-crop',
        dto,
        'org-1',
      ),
    ).rejects.toThrow(
      new NotFoundException('Crop not found'),
    );

    expect(cropsRepository.save).not.toHaveBeenCalled();
  });

  it('should remove a crop belonging to the organization', async () => {
    const crop = {
      id: 'crop-1',
      name: 'Blé tendre',
    } as unknown as Crop;

    cropsRepository.findOne.mockResolvedValue(crop);
    cropsRepository.remove.mockResolvedValue(crop);

    await service.remove(
      'crop-1',
      'org-1',
    );

    expect(cropsRepository.remove).toHaveBeenCalledWith(crop);
  });

  it('should reject removing a crop from another organization', async () => {
    cropsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.remove(
        'foreign-crop',
        'org-1',
      ),
    ).rejects.toThrow(
      new NotFoundException('Crop not found'),
    );

    expect(cropsRepository.remove).not.toHaveBeenCalled();
  });
});
