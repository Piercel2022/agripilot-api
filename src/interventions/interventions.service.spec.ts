import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotFoundException } from '@nestjs/common';

import { InterventionsService } from './interventions.service.js';

describe('InterventionsService', () => {
  const interventionsRepository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    remove: vi.fn(),
  };

  const campaignsRepository = {
    findOne: vi.fn(),
  };

  const service = new InterventionsService(
    interventionsRepository as any,
    campaignsRepository as any,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const organizationId = 'org-1';
  const campaignId = 'campaign-1';
  const interventionId = 'intervention-1';

  const campaign = {
    id: campaignId,
    name: 'Campagne Blé 2026-2027',
  };

  const intervention = {
    id: interventionId,
    name: 'Semis du blé',
    type: 'sowing',
    scheduledDate: '2026-10-15',
    completedDate: undefined,
    status: 'planned',
    notes: 'Semis de la parcelle Nord',
    campaign,
  };

  it('should create an intervention', async () => {
    campaignsRepository.findOne.mockResolvedValue(campaign);
    interventionsRepository.create.mockReturnValue(intervention);
    interventionsRepository.save.mockResolvedValue(intervention);

    const result = await service.create(
      {
        name: 'Semis du blé',
        type: 'sowing',
        scheduledDate: '2026-10-15',
        notes: 'Semis de la parcelle Nord',
        campaignId,
      } as any,
      organizationId,
    );

    expect(campaignsRepository.findOne).toHaveBeenCalled();
    expect(interventionsRepository.create).toHaveBeenCalledWith({
      name: 'Semis du blé',
      type: 'sowing',
      scheduledDate: '2026-10-15',
      completedDate: undefined,
      status: undefined,
      notes: 'Semis de la parcelle Nord',
      campaign,
    });
    expect(interventionsRepository.save).toHaveBeenCalledWith(intervention);
    expect(result).toEqual(intervention);
  });

  it('should reject creation when campaign does not exist', async () => {
    campaignsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create(
        {
          name: 'Semis du blé',
          type: 'sowing',
          campaignId,
        } as any,
        organizationId,
      ),
    ).rejects.toThrow(new NotFoundException('Campaign not found'));

    expect(interventionsRepository.create).not.toHaveBeenCalled();
    expect(interventionsRepository.save).not.toHaveBeenCalled();
  });

  it('should reject creation when campaign belongs to another organization', async () => {
    campaignsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create(
        {
          name: 'Semis du blé',
          type: 'sowing',
          campaignId,
        } as any,
        'other-org',
      ),
    ).rejects.toThrow(new NotFoundException('Campaign not found'));
  });

  it('should return all interventions for the organization', async () => {
    interventionsRepository.find.mockResolvedValue([intervention]);

    const result = await service.findAll(organizationId);

    expect(interventionsRepository.find).toHaveBeenCalledWith({
      where: {
        campaign: {
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
      },
      relations: {
        campaign: {
          crop: {
            field: {
              farm: true,
            },
          },
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    expect(result).toEqual([intervention]);
  });

  it('should return an intervention belonging to the organization', async () => {
    interventionsRepository.findOne.mockResolvedValue(intervention);

    const result = await service.findOne(interventionId, organizationId);

    expect(interventionsRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: interventionId,
        campaign: {
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
      },
      relations: {
        campaign: {
          crop: {
            field: {
              farm: true,
            },
          },
        },
      },
    });

    expect(result).toEqual(intervention);
  });

  it('should reject findOne when intervention does not exist', async () => {
    interventionsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.findOne(interventionId, organizationId),
    ).rejects.toThrow(new NotFoundException('Intervention not found'));
  });

  it('should reject findOne when intervention belongs to another organization', async () => {
    interventionsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.findOne(interventionId, 'other-org'),
    ).rejects.toThrow(new NotFoundException('Intervention not found'));
  });

  it('should update an intervention', async () => {
    interventionsRepository.findOne.mockResolvedValue({
      ...intervention,
    });

    interventionsRepository.save.mockImplementation(
      async (value) => value,
    );

    const result = await service.update(
      interventionId,
      {
        name: 'Semis du blé tendre',
        status: 'in_progress',
        notes: 'Intervention démarrée',
      } as any,
      organizationId,
    );

    expect(interventionsRepository.save).toHaveBeenCalled();

    expect(result).toMatchObject({
      id: interventionId,
      name: 'Semis du blé tendre',
      type: 'sowing',
      scheduledDate: '2026-10-15',
      status: 'in_progress',
      notes: 'Intervention démarrée',
      campaign,
    });
  });

  it('should reject update when intervention does not exist', async () => {
    interventionsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update(
        interventionId,
        {
          name: 'Intervention modifiée',
        } as any,
        organizationId,
      ),
    ).rejects.toThrow(new NotFoundException('Intervention not found'));

    expect(interventionsRepository.save).not.toHaveBeenCalled();
  });

  it('should reject update when intervention belongs to another organization', async () => {
    interventionsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update(
        interventionId,
        {
          name: 'Intervention modifiée',
        } as any,
        'other-org',
      ),
    ).rejects.toThrow(new NotFoundException('Intervention not found'));

    expect(interventionsRepository.save).not.toHaveBeenCalled();
  });

  it('should remove an intervention', async () => {
    interventionsRepository.findOne.mockResolvedValue(intervention);
    interventionsRepository.remove.mockResolvedValue(intervention);

    await service.remove(interventionId, organizationId);

    expect(interventionsRepository.remove).toHaveBeenCalledWith(intervention);
  });

  it('should reject remove when intervention does not exist', async () => {
    interventionsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.remove(interventionId, organizationId),
    ).rejects.toThrow(new NotFoundException('Intervention not found'));

    expect(interventionsRepository.remove).not.toHaveBeenCalled();
  });
});
