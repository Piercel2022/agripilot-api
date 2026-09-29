import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Organization } from './entities/organization.entity.js';
import { OrganizationsService } from './organizations.service.js';

describe('OrganizationsService', () => {
  let service: OrganizationsService;

  const organizationsRepository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: getRepositoryToken(Organization),
          useValue: organizationsRepository,
        },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an organization when the slug is available', async () => {
      const dto = {
        name: 'Ferme Demo',
        slug: 'ferme-demo',
      };

      const organization = {
        id: 'org-1',
        ...dto,
      } as Organization;

      organizationsRepository.findOne.mockResolvedValue(null);
      organizationsRepository.create.mockReturnValue(organization);
      organizationsRepository.save.mockResolvedValue(organization);

      const result = await service.create(dto);

      expect(organizationsRepository.findOne).toHaveBeenCalledWith({
        where: { slug: dto.slug },
      });
      expect(organizationsRepository.create).toHaveBeenCalledWith(dto);
      expect(organizationsRepository.save).toHaveBeenCalledWith(
        organization,
      );
      expect(result).toEqual(organization);
    });

    it('should reject duplicate slugs', async () => {
      const existingOrganization = {
        id: 'org-1',
        slug: 'ferme-demo',
      } as Organization;

      organizationsRepository.findOne.mockResolvedValue(
        existingOrganization,
      );

      await expect(
        service.create({
          name: 'Another Farm',
          slug: 'ferme-demo',
        }),
      ).rejects.toThrow(
        new ConflictException(
          'An organization with this slug already exists',
        ),
      );

      expect(organizationsRepository.create).not.toHaveBeenCalled();
      expect(organizationsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all organizations ordered by creation date', async () => {
      const organizations = [
        {
          id: 'org-1',
          name: 'Ferme A',
        },
      ] as Organization[];

      organizationsRepository.find.mockResolvedValue(organizations);

      const result = await service.findAll();

      expect(organizationsRepository.find).toHaveBeenCalledWith({
        order: {
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual(organizations);
    });
  });

  describe('findOne', () => {
    it('should return an organization', async () => {
      const organization = {
        id: 'org-1',
        name: 'Ferme A',
      } as Organization;

      organizationsRepository.findOne.mockResolvedValue(organization);

      const result = await service.findOne('org-1');

      expect(result).toEqual(organization);
    });

    it('should throw when organization does not exist', async () => {
      organizationsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('missing-org'),
      ).rejects.toThrow(
        new NotFoundException('Organization not found'),
      );
    });
  });

  describe('update', () => {
    it('should update an organization', async () => {
      const organization = {
        id: 'org-1',
        name: 'Ancien nom',
        slug: 'ancien-slug',
      } as Organization;

      organizationsRepository.findOne
        .mockResolvedValueOnce(organization)
        .mockResolvedValueOnce(null);

      organizationsRepository.save.mockResolvedValue({
        ...organization,
        name: 'Nouveau nom',
        slug: 'nouveau-slug',
      });

      const result = await service.update('org-1', {
        name: 'Nouveau nom',
        slug: 'nouveau-slug',
      });

      expect(organizationsRepository.findOne).toHaveBeenCalledTimes(2);
      expect(organizationsRepository.save).toHaveBeenCalledWith(
        organization,
      );

      expect(result).toEqual({
        ...organization,
        name: 'Nouveau nom',
        slug: 'nouveau-slug',
      });
    });

    it('should reject a duplicate slug during update', async () => {
      const organization = {
        id: 'org-1',
        name: 'Ferme A',
        slug: 'ferme-a',
      } as Organization;

      const otherOrganization = {
        id: 'org-2',
        slug: 'ferme-b',
      } as Organization;

      organizationsRepository.findOne
        .mockResolvedValueOnce(organization)
        .mockResolvedValueOnce(otherOrganization);

      await expect(
        service.update('org-1', {
          slug: 'ferme-b',
        }),
      ).rejects.toThrow(
        new ConflictException(
          'An organization with this slug already exists',
        ),
      );

      expect(organizationsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an existing organization', async () => {
      const organization = {
        id: 'org-1',
        name: 'Ferme A',
      } as Organization;

      organizationsRepository.findOne.mockResolvedValue(organization);
      organizationsRepository.remove.mockResolvedValue(organization);

      await service.remove('org-1');

      expect(organizationsRepository.remove).toHaveBeenCalledWith(
        organization,
      );
    });

    it('should reject removal when organization does not exist', async () => {
      organizationsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('missing-org'),
      ).rejects.toThrow(
        new NotFoundException('Organization not found'),
      );

      expect(organizationsRepository.remove).not.toHaveBeenCalled();
    });
  });
});
