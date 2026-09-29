import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Farm } from '../farms/entities/farm.entity.js';
import { CreateFieldDto } from './dto/create-field.dto.js';
import { UpdateFieldDto } from './dto/update-field.dto.js';
import { Field } from './entities/field.entity.js';
import { FieldsService } from './fields.service.js';

describe('FieldsService', () => {
  let service: FieldsService;

  const fieldsRepository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    remove: vi.fn(),
  };

  const farmsRepository = {
    findOne: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldsService,
        {
          provide: getRepositoryToken(Field),
          useValue: fieldsRepository,
        },
        {
          provide: getRepositoryToken(Farm),
          useValue: farmsRepository,
        },
      ],
    }).compile();

    service = module.get<FieldsService>(FieldsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a field for a farm belonging to the organization', async () => {
      const farm = {
        id: 'farm-1',
        organization: {
          id: 'org-1',
        },
      } as Farm;

      const dto: CreateFieldDto = {
        farmId: 'farm-1',
        name: 'Parcelle Nord',
        areaHectares: 12.5,
        soilType: 'Limoneux',
        cropType: 'Blé tendre',
        notes: 'Parcelle principale',
      };

      const field = {
        id: 'field-1',
        ...dto,
        farm,
      } as unknown as Field;

      farmsRepository.findOne.mockResolvedValue(farm);
      fieldsRepository.create.mockReturnValue(field);
      fieldsRepository.save.mockResolvedValue(field);

      const result = await service.create(dto, 'org-1');

      expect(farmsRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'farm-1',
          organization: {
            id: 'org-1',
          },
        },
      });

      expect(fieldsRepository.create).toHaveBeenCalledWith({
        name: 'Parcelle Nord',
        areaHectares: 12.5,
        soilType: 'Limoneux',
        cropType: 'Blé tendre',
        notes: 'Parcelle principale',
        farm,
      });

      expect(fieldsRepository.save).toHaveBeenCalledWith(field);
      expect(result).toEqual(field);
    });

    it('should reject a farm that does not belong to the organization', async () => {
      const dto: CreateFieldDto = {
        farmId: 'farm-other',
        name: 'Parcelle interdite',
        areaHectares: 10,
      };

      farmsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(dto, 'org-1'),
      ).rejects.toThrow(
        new NotFoundException('Farm not found'),
      );

      expect(fieldsRepository.create).not.toHaveBeenCalled();
      expect(fieldsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return only fields belonging to the organization', async () => {
      const fields = [
        {
          id: 'field-1',
          name: 'Parcelle Nord',
        },
      ] as Field[];

      fieldsRepository.find.mockResolvedValue(fields);

      const result = await service.findAll('org-1');

      expect(fieldsRepository.find).toHaveBeenCalledWith({
        where: {
          farm: {
            organization: {
              id: 'org-1',
            },
          },
        },
        relations: {
          farm: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual(fields);
    });
  });

  describe('findOne', () => {
    it('should return a field belonging to the organization', async () => {
      const field = {
        id: 'field-1',
        name: 'Parcelle Nord',
      } as Field;

      fieldsRepository.findOne.mockResolvedValue(field);

      const result = await service.findOne(
        'field-1',
        'org-1',
      );

      expect(fieldsRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'field-1',
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

      expect(result).toEqual(field);
    });

    it('should throw when the field does not belong to the organization', async () => {
      fieldsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('field-other', 'org-1'),
      ).rejects.toThrow(
        new NotFoundException('Field not found'),
      );
    });
  });

  describe('update', () => {
    it('should update a field belonging to the organization', async () => {
      const field = {
        id: 'field-1',
        name: 'Parcelle Nord',
        areaHectares: 12.5,
        soilType: 'Limoneux',
        cropType: 'Blé',
        notes: 'Anciennes notes',
      } as Field;

      const dto: UpdateFieldDto = {
        cropType: 'Maïs',
        notes: 'Nouvelles notes',
      };

      fieldsRepository.findOne.mockResolvedValue(field);
      fieldsRepository.save.mockResolvedValue({
        ...field,
        ...dto,
      });

      const result = await service.update(
        'field-1',
        dto,
        'org-1',
      );

      expect(field.cropType).toBe('Maïs');
      expect(field.notes).toBe('Nouvelles notes');
      expect(fieldsRepository.save).toHaveBeenCalledWith(field);
      expect(result).toEqual({
        ...field,
        ...dto,
      });
    });

    it('should reject updating a field from another organization', async () => {
      fieldsRepository.findOne.mockResolvedValue(null);

      const dto: UpdateFieldDto = {
        cropType: 'Maïs',
      };

      await expect(
        service.update('field-other', dto, 'org-1'),
      ).rejects.toThrow(
        new NotFoundException('Field not found'),
      );

      expect(fieldsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a field belonging to the organization', async () => {
      const field = {
        id: 'field-1',
        name: 'Parcelle Nord',
      } as Field;

      fieldsRepository.findOne.mockResolvedValue(field);
      fieldsRepository.remove.mockResolvedValue(field);

      await service.remove('field-1', 'org-1');

      expect(fieldsRepository.remove).toHaveBeenCalledWith(
        field,
      );
    });

    it('should reject removing a field from another organization', async () => {
      fieldsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('field-other', 'org-1'),
      ).rejects.toThrow(
        new NotFoundException('Field not found'),
      );

      expect(fieldsRepository.remove).not.toHaveBeenCalled();
    });
  });
});