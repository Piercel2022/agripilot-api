import { Test, TestingModule } from '@nestjs/testing';

import { CampaignsController } from './campaigns.controller.js';
import { CampaignsService } from './campaigns.service.js';
import { CampaignStatus } from './entities/campaign.entity.js';

describe('CampaignsController', () => {
  let controller: CampaignsController;

  const campaignsService = {
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
        controllers: [CampaignsController],
        providers: [
          {
            provide: CampaignsService,
            useValue: campaignsService,
          },
        ],
      }).compile();

    controller =
      module.get<CampaignsController>(
        CampaignsController,
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a campaign', async () => {
    const dto = {
      name: 'Campagne Blé 2026-2027',
      season: '2026-2027',
      startDate: '2026-10-01',
      endDate: '2027-07-31',
      status: CampaignStatus.PLANNED,
      notes: 'Campagne principale',
      cropId: 'crop-id',
    };

    const expected = {
      id: 'campaign-id',
      ...dto,
    };

    campaignsService.create.mockResolvedValue(expected);

    await expect(
      controller.create(dto, request),
    ).resolves.toEqual(expected);

    expect(campaignsService.create).toHaveBeenCalledWith(
      dto,
      'organization-id',
    );
  });

  it('should return all campaigns', async () => {
    const expected = [
      {
        id: 'campaign-id',
        name: 'Campagne Blé 2026-2027',
      },
    ];

    campaignsService.findAll.mockResolvedValue(expected);

    await expect(
      controller.findAll(request),
    ).resolves.toEqual(expected);

    expect(campaignsService.findAll).toHaveBeenCalledWith(
      'organization-id',
    );
  });

  it('should return one campaign', async () => {
    const expected = {
      id: 'campaign-id',
      name: 'Campagne Blé 2026-2027',
    };

    campaignsService.findOne.mockResolvedValue(expected);

    await expect(
      controller.findOne('campaign-id', request),
    ).resolves.toEqual(expected);

    expect(campaignsService.findOne).toHaveBeenCalledWith(
      'campaign-id',
      'organization-id',
    );
  });

  it('should update a campaign', async () => {
    const dto = {
      status: CampaignStatus.ACTIVE,
    };

    const expected = {
      id: 'campaign-id',
      name: 'Campagne Blé 2026-2027',
      status: CampaignStatus.ACTIVE,
    };

    campaignsService.update.mockResolvedValue(expected);

    await expect(
      controller.update(
        'campaign-id',
        dto,
        request,
      ),
    ).resolves.toEqual(expected);

    expect(campaignsService.update).toHaveBeenCalledWith(
      'campaign-id',
      dto,
      'organization-id',
    );
  });

  it('should remove a campaign', async () => {
    campaignsService.remove.mockResolvedValue(undefined);

    await expect(
      controller.remove('campaign-id', request),
    ).resolves.toBeUndefined();

    expect(campaignsService.remove).toHaveBeenCalledWith(
      'campaign-id',
      'organization-id',
    );
  });
});
