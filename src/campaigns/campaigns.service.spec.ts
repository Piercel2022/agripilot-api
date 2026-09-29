import {
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Crop } from '../crops/entities/crop.entity.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { UpdateCampaignDto } from './dto/update-campaign.dto.js';
import {
  Campaign,
  CampaignStatus,
} from './entities/campaign.entity.js';
import { CampaignsService } from './campaigns.service.js';

describe('CampaignsService', () => {
  let service: CampaignsService;

  let campaignsRepository: {
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  let cropsRepository: {
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    campaignsRepository = {
      create: vi.fn(),
      save: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      remove: vi.fn(),
    };

    cropsRepository = {
      findOne: vi.fn(),
    };

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          CampaignsService,
          {
            provide: getRepositoryToken(Campaign),
            useValue: campaignsRepository,
          },
          {
            provide: getRepositoryToken(Crop),
            useValue: cropsRepository,
          },
        ],
      })
        .compile();

    service = module.get<CampaignsService>(
      CampaignsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a campaign for a crop in the organization', async () => {
    const organizationId =
      'org-1';

    const crop = {
      id: 'crop-1',
      name: 'Blé tendre',
      field: {
        id: 'field-1',
        farm: {
          id: 'farm-1',
          organization: {
            id: organizationId,
          },
        },
      },
    } as Crop;

    const dto: CreateCampaignDto = {
      name: 'Campagne Blé 2026-2027',
      season: '2026-2027',
      startDate: '2026-10-01',
      endDate: '2027-07-31',
      status: CampaignStatus.ACTIVE,
      notes: 'Campagne principale',
      cropId: 'crop-1',
    };

    const campaign = {
      id: 'campaign-1',
      ...dto,
      crop,
    } as unknown as Campaign;

    cropsRepository.findOne.mockResolvedValue(crop);
    campaignsRepository.create.mockReturnValue(campaign);
    campaignsRepository.save.mockResolvedValue(campaign);

    const result = await service.create(
      dto,
      organizationId,
    );

    expect(
      cropsRepository.findOne,
    ).toHaveBeenCalledWith({
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
      relations: {
        field: {
          farm: true,
        },
      },
    });

    expect(
      campaignsRepository.create,
    ).toHaveBeenCalledWith({
      name: dto.name,
      season: dto.season,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status: dto.status,
      notes: dto.notes,
      crop,
    });

    expect(result).toEqual(campaign);
  });

  it('should reject creation when crop does not exist', async () => {
    cropsRepository.findOne.mockResolvedValue(null);

    const dto: CreateCampaignDto = {
      name: 'Campagne test',
      season: '2026',
      cropId: 'missing-crop',
    };

    await expect(
      service.create(dto, 'org-1'),
    ).rejects.toThrow(
      new NotFoundException('Crop not found'),
    );

    expect(
      campaignsRepository.create,
    ).not.toHaveBeenCalled();

    expect(
      campaignsRepository.save,
    ).not.toHaveBeenCalled();
  });

  it('should reject creation for a crop from another organization', async () => {
    cropsRepository.findOne.mockResolvedValue(null);

    const dto: CreateCampaignDto = {
      name: 'Campagne cross-org',
      season: '2026',
      cropId: 'foreign-crop',
    };

    await expect(
      service.create(dto, 'org-1'),
    ).rejects.toThrow(
      new NotFoundException('Crop not found'),
    );

    expect(
      campaignsRepository.create,
    ).not.toHaveBeenCalled();

    expect(
      campaignsRepository.save,
    ).not.toHaveBeenCalled();
  });

  it('should find all campaigns for the organization', async () => {
    const campaigns = [
      {
        id: 'campaign-1',
        name: 'Campagne Blé',
      },
    ] as Campaign[];

    campaignsRepository.find.mockResolvedValue(
      campaigns,
    );

    const result = await service.findAll(
      'org-1',
    );

    expect(
      campaignsRepository.find,
    ).toHaveBeenCalledWith({
      where: {
        crop: {
          field: {
            farm: {
              organization: {
                id: 'org-1',
              },
            },
          },
        },
      },
      relations: {
        crop: {
          field: {
            farm: true,
          },
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    expect(result).toEqual(campaigns);
  });

  it('should find one campaign for the organization', async () => {
    const campaign = {
      id: 'campaign-1',
      name: 'Campagne Blé',
    } as Campaign;

    campaignsRepository.findOne.mockResolvedValue(
      campaign,
    );

    const result = await service.findOne(
      'campaign-1',
      'org-1',
    );

    expect(
      campaignsRepository.findOne,
    ).toHaveBeenCalledWith({
      where: {
        id: 'campaign-1',
        crop: {
          field: {
            farm: {
              organization: {
                id: 'org-1',
              },
            },
          },
        },
      },
      relations: {
        crop: {
          field: {
            farm: true,
          },
        },
      },
    });

    expect(result).toEqual(campaign);
  });

  it('should reject findOne when campaign does not exist', async () => {
    campaignsRepository.findOne.mockResolvedValue(
      null,
    );

    await expect(
      service.findOne(
        'missing-campaign',
        'org-1',
      ),
    ).rejects.toThrow(
      new NotFoundException('Campaign not found'),
    );
  });

  it('should reject findOne for a campaign from another organization', async () => {
    campaignsRepository.findOne.mockResolvedValue(
      null,
    );

    await expect(
      service.findOne(
        'foreign-campaign',
        'org-1',
      ),
    ).rejects.toThrow(
      new NotFoundException('Campaign not found'),
    );
  });

  it('should update a campaign', async () => {
    const campaign = {
      id: 'campaign-1',
      name: 'Campagne Blé',
      season: '2026-2027',
      startDate: '2026-10-01',
      endDate: '2027-07-31',
      status: CampaignStatus.ACTIVE,
      notes: 'Initial',
    } as Campaign;

    const dto: UpdateCampaignDto = {
      name: 'Campagne Blé Premium',
      status: CampaignStatus.COMPLETED,
      notes: 'Terminée',
    };

    campaignsRepository.findOne.mockResolvedValue(
      campaign,
    );
    campaignsRepository.save.mockResolvedValue(
      campaign,
    );

    const result = await service.update(
      'campaign-1',
      dto,
      'org-1',
    );

    expect(campaign.name).toBe(
      'Campagne Blé Premium',
    );
    expect(campaign.status).toBe(
      CampaignStatus.COMPLETED,
    );
    expect(campaign.notes).toBe(
      'Terminée',
    );

    expect(
      campaignsRepository.save,
    ).toHaveBeenCalledWith(campaign);

    expect(result).toEqual(campaign);
  });

  it('should reject update for a campaign from another organization', async () => {
    campaignsRepository.findOne.mockResolvedValue(
      null,
    );

    const dto: UpdateCampaignDto = {
      status: CampaignStatus.COMPLETED,
    };

    await expect(
      service.update(
        'foreign-campaign',
        dto,
        'org-1',
      ),
    ).rejects.toThrow(
      new NotFoundException('Campaign not found'),
    );

    expect(
      campaignsRepository.save,
    ).not.toHaveBeenCalled();
  });

  it('should remove a campaign', async () => {
    const campaign = {
      id: 'campaign-1',
      name: 'Campagne Blé',
    } as Campaign;

    campaignsRepository.findOne.mockResolvedValue(
      campaign,
    );
    campaignsRepository.remove.mockResolvedValue(
      undefined,
    );

    await service.remove(
      'campaign-1',
      'org-1',
    );

    expect(
      campaignsRepository.remove,
    ).toHaveBeenCalledWith(campaign);
  });

  it('should reject remove for a campaign from another organization', async () => {
    campaignsRepository.findOne.mockResolvedValue(
      null,
    );

    await expect(
      service.remove(
        'foreign-campaign',
        'org-1',
      ),
    ).rejects.toThrow(
      new NotFoundException('Campaign not found'),
    );

    expect(
      campaignsRepository.remove,
    ).not.toHaveBeenCalled();
  });
});
