import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InterventionsController } from './interventions.controller.js';

describe('InterventionsController', () => {
  const interventionsService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  const controller = new InterventionsController(
    interventionsService as any,
  );

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
        slug: 'ferme-demo-agripilot',
      },
    },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an intervention', async () => {
    const dto = {
      name: 'Semis du blé',
      type: 'sowing',
      scheduledDate: '2026-10-15',
      campaignId: 'campaign-1',
    };

    const intervention = {
      id: 'intervention-1',
      ...dto,
    };

    interventionsService.create.mockResolvedValue(intervention);

    const result = await controller.create(dto as any, request);

    expect(interventionsService.create).toHaveBeenCalledWith(
      dto,
      organizationId,
    );
    expect(result).toEqual(intervention);
  });

  it('should return all interventions', async () => {
    const interventions = [
      {
        id: 'intervention-1',
        name: 'Semis du blé',
      },
    ];

    interventionsService.findAll.mockResolvedValue(interventions);

    const result = await controller.findAll(request);

    expect(interventionsService.findAll).toHaveBeenCalledWith(
      organizationId,
    );
    expect(result).toEqual(interventions);
  });

  it('should return one intervention', async () => {
    const intervention = {
      id: 'intervention-1',
      name: 'Semis du blé',
    };

    interventionsService.findOne.mockResolvedValue(intervention);

    const result = await controller.findOne(
      'intervention-1',
      request,
    );

    expect(interventionsService.findOne).toHaveBeenCalledWith(
      'intervention-1',
      organizationId,
    );
    expect(result).toEqual(intervention);
  });

  it('should update an intervention', async () => {
    const dto = {
      status: 'completed',
      completedDate: '2026-10-15',
    };

    const intervention = {
      id: 'intervention-1',
      name: 'Semis du blé',
      status: 'completed',
    };

    interventionsService.update.mockResolvedValue(intervention);

    const result = await controller.update(
      'intervention-1',
      dto as any,
      request,
    );

    expect(interventionsService.update).toHaveBeenCalledWith(
      'intervention-1',
      dto,
      organizationId,
    );
    expect(result).toEqual(intervention);
  });

  it('should remove an intervention', async () => {
    interventionsService.remove.mockResolvedValue(undefined);

    const result = await controller.remove(
      'intervention-1',
      request,
    );

    expect(interventionsService.remove).toHaveBeenCalledWith(
      'intervention-1',
      organizationId,
    );
    expect(result).toBeUndefined();
  });
});
