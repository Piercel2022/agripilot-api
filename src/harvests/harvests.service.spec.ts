import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { Campaign } from '../campaigns/entities/campaign.entity.js';
import { Crop } from '../crops/entities/crop.entity.js';
import { HarvestsService } from './harvests.service.js';
import { Harvest } from './entities/harvest.entity.js';

describe('HarvestsService', () => {
  let service: HarvestsService;

  let harvestsRepository: {
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  let cropsRepository: {
    findOne: ReturnType<typeof vi.fn>;
  };

  let campaignsRepository: {
    findOne: ReturnType<typeof vi.fn>;
  };

  const organizationId = 'org-1';
  const otherOrganizationId = 'org-2';

  const crop = {
    id: 'crop-1',
    field: {
      id: 'field-1',
      farm: {
        id: 'farm-1',
      },
    },
  } as Crop;

  const campaign = {
    id: 'campaign-1',
    crop,
  } as Campaign;

  const harvest = {
    id: 'harvest-1',
    crop,
    campaign,
    harvestDate: '2026-09-30',
    quantity: 100,
    unit: 'tonnes',
    yield: 8,
    quality: 'A',
    notes: 'Bonne récolte',
  } as unknown as Harvest;

  beforeEach(() => {
    harvestsRepository = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      remove: vi.fn(),
    };

    cropsRepository = {
      findOne: vi.fn(),
    };

    campaignsRepository = {
      findOne: vi.fn(),
    };

    service = new HarvestsService(
      harvestsRepository as unknown as Repository<Harvest>,
      cropsRepository as unknown as Repository<Crop>,
      campaignsRepository as unknown as Repository<Campaign>,
    );
  });

  describe('create', () => {
    const createHarvestDto = {
      cropId: 'crop-1',
      campaignId: 'campaign-1',
      harvestDate: '2026-09-30',
      quantity: 100,
      unit: 'tonnes',
      yield: 8,
      quality: 'A',
      notes: 'Bonne récolte',
    };

    it('should create a harvest for a crop and campaign belonging to the organization', async () => {
      cropsRepository.findOne.mockResolvedValue(crop);
      campaignsRepository.findOne.mockResolvedValue(campaign);
      harvestsRepository.create.mockReturnValue(harvest);
      harvestsRepository.save.mockResolvedValue(harvest);

      const result = await service.create(
        createHarvestDto,
        organizationId,
      );

      expect(result).toBe(harvest);

      expect(cropsRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'crop-1',
            field: {
              farm: {
                organization: {
                  id: organizationId,
                },
              },
            },
          },
        }),
      );

      expect(campaignsRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'campaign-1',
            crop: {
              id: 'crop-1',
              field: {
                farm: {
                  organization: {
                    id: organizationId,
                  },
                },
              },
            },
          },
        }),
      );

      expect(harvestsRepository.create).toHaveBeenCalledWith({
        crop,
        campaign,
        harvestDate: createHarvestDto.harvestDate,
        quantity: createHarvestDto.quantity,
        unit: createHarvestDto.unit,
        yield: createHarvestDto.yield,
        quality: createHarvestDto.quality,
        notes: createHarvestDto.notes,
      });

      expect(harvestsRepository.save).toHaveBeenCalledWith(harvest);
    });

    it('should reject a crop that does not belong to the organization', async () => {
      cropsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(createHarvestDto, otherOrganizationId),
      ).rejects.toThrow(
        new NotFoundException('Crop not found'),
      );

      expect(campaignsRepository.findOne).not.toHaveBeenCalled();
      expect(harvestsRepository.create).not.toHaveBeenCalled();
      expect(harvestsRepository.save).not.toHaveBeenCalled();
    });

    it('should reject a campaign that does not belong to the organization or crop', async () => {
      cropsRepository.findOne.mockResolvedValue(crop);
      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(createHarvestDto, organizationId),
      ).rejects.toThrow(
        new NotFoundException('Campaign not found'),
      );

      expect(harvestsRepository.create).not.toHaveBeenCalled();
      expect(harvestsRepository.save).not.toHaveBeenCalled();
    });

    it('should reject a campaign belonging to another crop', async () => {
      cropsRepository.findOne.mockResolvedValue(crop);

      const otherCrop = {
        ...crop,
        id: 'crop-2',
      } as Crop;

      campaignsRepository.findOne.mockResolvedValue({
        ...campaign,
        crop: otherCrop,
      } as Campaign);

      await expect(
        service.create(createHarvestDto, organizationId),
      ).rejects.toThrow(
        new BadRequestException(
          'Campaign does not belong to the selected crop',
        ),
      );

      expect(harvestsRepository.create).not.toHaveBeenCalled();
      expect(harvestsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all organization harvests without filters', async () => {
      harvestsRepository.find.mockResolvedValue([harvest]);

      const result = await service.findAll(organizationId);

      expect(result).toEqual([harvest]);

      expect(harvestsRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            crop: {
              field: {
                farm: {
                  organization: {
                    id: organizationId,
                  },
                },
              },
            },
          },
        }),
      );
    });

    it('should filter harvests by crop', async () => {
      harvestsRepository.find.mockResolvedValue([harvest]);

      await service.findAll(
        organizationId,
        'crop-1',
      );

      expect(harvestsRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            crop: {
              id: 'crop-1',
              field: {
                farm: {
                  organization: {
                    id: organizationId,
                  },
                },
              },
            },
          },
        }),
      );
    });

    it('should filter harvests by campaign', async () => {
      harvestsRepository.find.mockResolvedValue([harvest]);

      await service.findAll(
        organizationId,
        undefined,
        'campaign-1',
      );

      expect(harvestsRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            crop: {
              field: {
                farm: {
                  organization: {
                    id: organizationId,
                  },
                },
              },
            },
            campaign: {
              id: 'campaign-1',
            },
          },
        }),
      );
    });

    it('should filter harvests by crop and campaign', async () => {
      harvestsRepository.find.mockResolvedValue([harvest]);

      await service.findAll(
        organizationId,
        'crop-1',
        'campaign-1',
      );

      expect(harvestsRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            crop: {
              id: 'crop-1',
              field: {
                farm: {
                  organization: {
                    id: organizationId,
                  },
                },
              },
            },
            campaign: {
              id: 'campaign-1',
            },
          },
        }),
      );
    });

    it('should enforce organization isolation in findAll', async () => {
      harvestsRepository.find.mockResolvedValue([]);

      await service.findAll(otherOrganizationId);

      expect(harvestsRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            crop: {
              field: {
                farm: {
                  organization: {
                    id: otherOrganizationId,
                  },
                },
              },
            },
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a harvest belonging to the organization', async () => {
      harvestsRepository.findOne.mockResolvedValue(harvest);

      const result = await service.findOne(
        'harvest-1',
        organizationId,
      );

      expect(result).toBe(harvest);

      expect(harvestsRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'harvest-1',
            crop: {
              field: {
                farm: {
                  organization: {
                    id: organizationId,
                  },
                },
              },
            },
          },
        }),
      );
    });

    it('should reject a harvest from another organization', async () => {
      harvestsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(
          'harvest-1',
          otherOrganizationId,
        ),
      ).rejects.toThrow(
        new NotFoundException('Harvest not found'),
      );
    });

    it('should reject a nonexistent harvest', async () => {
      harvestsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(
          'missing-harvest',
          organizationId,
        ),
      ).rejects.toThrow(
        new NotFoundException('Harvest not found'),
      );
    });
  });

  describe('update', () => {
    it('should update harvest scalar fields', async () => {
      const existingHarvest = {
        ...harvest,
      } as Harvest;

      harvestsRepository.findOne.mockResolvedValue(existingHarvest);
      harvestsRepository.save.mockResolvedValue(existingHarvest);

      const result = await service.update(
        'harvest-1',
        {
          harvestDate: '2026-10-01',
          quantity: 120,
          unit: 'tonnes',
          yield: 9,
          quality: 'A+',
          notes: 'Très bonne récolte',
        },
        organizationId,
      );

      expect(result).toBe(existingHarvest);
      expect(existingHarvest.harvestDate).toBe('2026-10-01');
      expect(existingHarvest.quantity).toBe(120);
      expect(existingHarvest.unit).toBe('tonnes');
      expect(existingHarvest.yield).toBe(9);
      expect(existingHarvest.quality).toBe('A+');
      expect(existingHarvest.notes).toBe(
        'Très bonne récolte',
      );

      expect(harvestsRepository.save).toHaveBeenCalledWith(
        existingHarvest,
      );
    });

    it('should update the crop when the new crop belongs to the organization', async () => {
      const existingHarvest = {
        ...harvest,
      } as Harvest;

      const newCrop = {
        ...crop,
        id: 'crop-2',
      } as Crop;

      harvestsRepository.findOne.mockResolvedValue(
        existingHarvest,
      );
      cropsRepository.findOne.mockResolvedValue(newCrop);
      campaignsRepository.findOne.mockResolvedValue({
        ...campaign,
        crop: newCrop,
      } as Campaign);
      harvestsRepository.save.mockResolvedValue(
        existingHarvest,
      );

      await service.update(
        'harvest-1',
        {
          cropId: 'crop-2',
        },
        organizationId,
      );

      expect(existingHarvest.crop).toBe(newCrop);
      expect(cropsRepository.findOne).toHaveBeenCalled();
      expect(campaignsRepository.findOne).toHaveBeenCalled();
      expect(harvestsRepository.save).toHaveBeenCalledWith(
        existingHarvest,
      );
    });

    it('should reject an update with a crop from another organization', async () => {
      harvestsRepository.findOne.mockResolvedValue(harvest);
      cropsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(
          'harvest-1',
          {
            cropId: 'foreign-crop',
          },
          otherOrganizationId,
        ),
      ).rejects.toThrow(
        new NotFoundException('Crop not found'),
      );

      expect(harvestsRepository.save).not.toHaveBeenCalled();
    });

    it('should update the campaign when it belongs to the selected crop', async () => {
      const existingHarvest = {
        ...harvest,
      } as Harvest;

      const newCampaign = {
        id: 'campaign-2',
        crop,
      } as Campaign;

      harvestsRepository.findOne.mockResolvedValue(
        existingHarvest,
      );
      campaignsRepository.findOne.mockResolvedValue(
        newCampaign,
      );
      harvestsRepository.save.mockResolvedValue(
        existingHarvest,
      );

      await service.update(
        'harvest-1',
        {
          campaignId: 'campaign-2',
        },
        organizationId,
      );

      expect(existingHarvest.campaign).toBe(
        newCampaign,
      );

      expect(campaignsRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'campaign-2',
            crop: {
              id: crop.id,
              field: {
                farm: {
                  organization: {
                    id: organizationId,
                  },
                },
              },
            },
          },
        }),
      );

      expect(harvestsRepository.save).toHaveBeenCalledWith(
        existingHarvest,
      );
    });

    it('should reject a nonexistent campaign during update', async () => {
      harvestsRepository.findOne.mockResolvedValue(harvest);
      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(
          'harvest-1',
          {
            campaignId: 'missing-campaign',
          },
          organizationId,
        ),
      ).rejects.toThrow(
        new NotFoundException('Campaign not found'),
      );

      expect(harvestsRepository.save).not.toHaveBeenCalled();
    });

    it('should reject changing the crop when the existing campaign does not belong to the new crop', async () => {
      const existingHarvest = {
        ...harvest,
      } as Harvest;

      const newCrop = {
        ...crop,
        id: 'crop-2',
      } as Crop;

      harvestsRepository.findOne.mockResolvedValue(
        existingHarvest,
      );
      cropsRepository.findOne.mockResolvedValue(newCrop);
      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(
          'harvest-1',
          {
            cropId: 'crop-2',
          },
          organizationId,
        ),
      ).rejects.toThrow(
        new BadRequestException(
          'Campaign does not belong to the selected crop',
        ),
      );

      expect(harvestsRepository.save).not.toHaveBeenCalled();
    });

    it('should reject updating a nonexistent harvest', async () => {
      harvestsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(
          'missing-harvest',
          {
            quantity: 200,
          },
          organizationId,
        ),
      ).rejects.toThrow(
        new NotFoundException('Harvest not found'),
      );

      expect(harvestsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a harvest belonging to the organization', async () => {
      harvestsRepository.findOne.mockResolvedValue(harvest);
      harvestsRepository.remove.mockResolvedValue(harvest);

      await service.remove(
        'harvest-1',
        organizationId,
      );

      expect(harvestsRepository.remove).toHaveBeenCalledWith(
        harvest,
      );
    });

    it('should not remove a harvest from another organization', async () => {
      harvestsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove(
          'harvest-1',
          otherOrganizationId,
        ),
      ).rejects.toThrow(
        new NotFoundException('Harvest not found'),
      );

      expect(harvestsRepository.remove).not.toHaveBeenCalled();
    });
  });
});
