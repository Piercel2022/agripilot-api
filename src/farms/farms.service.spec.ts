import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Organization } from '../organizations/entities/organization.entity.js';
import { Farm } from './entities/farm.entity.js';
import { FarmsService } from './farms.service.js';

describe('FarmsService', () => {
  let service: FarmsService;

  const farmsRepository = {
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
        FarmsService,
        {
          provide: getRepositoryToken(Farm),
          useValue: farmsRepository,
        },
        {
          provide: getRepositoryToken(Organization),
          useValue: organizationsRepository,
        },
      ],
    }).compile();

    service = module.get<FarmsService>(FarmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a farm for an existing organization', async () => {
      const organization = {
        id: 'org-1',
        name: 'Farm Organization',
      } as Organization;

      const dto = {
        name: 'Ferme des Trois Vallées',
        address: '12 Route des Champs',
        city: 'Strasbourg',
        postalCode: '67000',
        country: 'France',
      };

      const farm = {
        id: 'farm-1',
        ...dto,
        organization,
      } as Farm;

      organizationsRepository.findOne.mockResolvedValue(organization);
      farmsRepository.create.mockReturnValue(farm);
      farmsRepository.save.mockResolvedValue(farm);

      const result = await service.create(dto, 'org-1');

      expect(organizationsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'org-1' },
      });
      expect(farmsRepository.create).toHaveBeenCalledWith({
        ...dto,
        organization,
      });
      expect(farmsRepository.save).toHaveBeenCalledWith(farm);
      expect(result).toEqual(farm);
    });

    it('should throw when organization does not exist', async () => {
      organizationsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(
          {
            name: 'Ferme Test',
          },
          'missing-org',
        ),
      ).rejects.toThrow(
        new NotFoundException('Organization not found'),
      );

      expect(farmsRepository.create).not.toHaveBeenCalled();
      expect(farmsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return farms belonging to the organization', async () => {
      const farms = [
        {
          id: 'farm-1',
          name: 'Ferme A',
        },
      ] as Farm[];

      farmsRepository.find.mockResolvedValue(farms);

      const result = await service.findAll('org-1');

      expect(farmsRepository.find).toHaveBeenCalledWith({
        where: {
          organization: {
            id: 'org-1',
          },
        },
        order: {
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual(farms);
    });
  });

  describe('findOne', () => {
    it('should return a farm belonging to the organization', async () => {
      const farm = {
        id: 'farm-1',
        name: 'Ferme A',
      } as Farm;

      farmsRepository.findOne.mockResolvedValue(farm);

      const result = await service.findOne('farm-1', 'org-1');

      expect(farmsRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'farm-1',
          organization: {
            id: 'org-1',
          },
        },
      });

      expect(result).toEqual(farm);
    });

    it('should throw when the farm is not found in the organization', async () => {
      farmsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('farm-1', 'org-1'),
      ).rejects.toThrow(
        new NotFoundException('Farm not found'),
      );
    });
  });

  describe('update', () => {
    it('should update the farm', async () => {
      const farm = {
        id: 'farm-1',
        name: 'Ancien nom',
        address: 'Ancienne adresse',
        city: 'Strasbourg',
        postalCode: '67000',
        country: 'France',
      } as Farm;

      farmsRepository.findOne.mockResolvedValue(farm);
      farmsRepository.save.mockResolvedValue({
        ...farm,
        name: 'Nouveau nom',
      });

      const result = await service.update(
        'farm-1',
        {
          name: 'Nouveau nom',
        },
        'org-1',
      );

      expect(farm.name).toBe('Nouveau nom');
      expect(farmsRepository.save).toHaveBeenCalledWith(farm);
      expect(result).toEqual({
        ...farm,
        name: 'Nouveau nom',
      });
    });

    it('should reject an update when the farm is not found', async () => {
      farmsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(
          'farm-1',
          { name: 'Nouveau nom' },
          'org-1',
        ),
      ).rejects.toThrow(
        new NotFoundException('Farm not found'),
      );

      expect(farmsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an existing farm', async () => {
      const farm = {
        id: 'farm-1',
        name: 'Ferme A',
      } as Farm;

      farmsRepository.findOne.mockResolvedValue(farm);
      farmsRepository.remove.mockResolvedValue(farm);

      await service.remove('farm-1', 'org-1');

      expect(farmsRepository.remove).toHaveBeenCalledWith(farm);
    });

    it('should reject removal when the farm is not found', async () => {
      farmsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('farm-1', 'org-1'),
      ).rejects.toThrow(
        new NotFoundException('Farm not found'),
      );

      expect(farmsRepository.remove).not.toHaveBeenCalled();
    });
  });
});
