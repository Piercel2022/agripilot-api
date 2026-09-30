import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ObservationsController } from './observations.controller.js';

describe('ObservationsController', () => {
  const observationsService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  let controller: ObservationsController;

  const request = {
    user: {
      organization: {
        id: 'organization-1',
      },
    },
  } as never;

  beforeEach(() => {
    vi.clearAllMocks();

    controller = new ObservationsController(
      observationsService as never,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  it('creates an observation', async () => {
    const dto = {
      name: 'Observation parcelle Nord',
      type: 'crop',
      observedAt: '2026-10-20',
      severity: 'medium',
      description: 'Observation de la culture.',
      notes: 'Surveillance recommandée.',
      fieldId: 'field-1',
    };

    const observation = {
      id: 'observation-1',
      ...dto,
    };

    observationsService.create.mockResolvedValue(observation);

    const result = await controller.create(dto as never, request);

    expect(observationsService.create).toHaveBeenCalledWith(
      dto,
      'organization-1',
    );
    expect(result).toEqual(observation);
  });

  it('returns all observations', async () => {
    const observations = [
      {
        id: 'observation-1',
        name: 'Observation 1',
      },
      {
        id: 'observation-2',
        name: 'Observation 2',
      },
    ];

    observationsService.findAll.mockResolvedValue(observations);

    const result = await controller.findAll(request);

    expect(observationsService.findAll).toHaveBeenCalledWith(
      'organization-1',
    );
    expect(result).toEqual(observations);
  });

  it('returns one observation', async () => {
    const observation = {
      id: 'observation-1',
      name: 'Observation parcelle Nord',
    };

    observationsService.findOne.mockResolvedValue(observation);

    const result = await controller.findOne(
      'observation-1',
      request,
    );

    expect(observationsService.findOne).toHaveBeenCalledWith(
      'observation-1',
      'organization-1',
    );
    expect(result).toEqual(observation);
  });

  it('updates an observation', async () => {
    const dto = {
      name: 'Observation mise à jour',
      severity: 'high',
    };

    const observation = {
      id: 'observation-1',
      ...dto,
    };

    observationsService.update.mockResolvedValue(observation);

    const result = await controller.update(
      'observation-1',
      dto as never,
      request,
    );

    expect(observationsService.update).toHaveBeenCalledWith(
      'observation-1',
      dto,
      'organization-1',
    );
    expect(result).toEqual(observation);
  });

  it('removes an observation', async () => {
    observationsService.remove.mockResolvedValue(undefined);

    const result = await controller.remove(
      'observation-1',
      request,
    );

    expect(observationsService.remove).toHaveBeenCalledWith(
      'observation-1',
      'organization-1',
    );
    expect(result).toBeUndefined();
  });
});
