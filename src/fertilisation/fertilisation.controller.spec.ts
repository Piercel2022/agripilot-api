import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FertilisationApplicationMethod,
  FertilisationStatus,
  FertilisationType,
  FertilisationUnit,
} from './entities/fertilisation.entity.js';
import { FertilisationController } from './fertilisation.controller.js';

describe('FertilisationController', () => {
  const organizationId = 'org-1';
  const fertilisationId = 'fertilisation-1';

  const request = {
    user: {
      organization: {
        id: organizationId,
      },
    },
  };

  const fertilisation = {
    id: fertilisationId,
    name: 'Fertilisation Blé',
    product: 'NPK 15-15-15',
    type: FertilisationType.NPK,
    scheduledDate: '2026-10-25',
    completedDate: undefined,
    quantity: '250.00',
    unit: FertilisationUnit.KG,
    applicationMethod: FertilisationApplicationMethod.BROADCAST,
    status: FertilisationStatus.PLANNED,
    notes: 'Application prévue après les semis',
  };

  const fertilisationService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  const controller = new FertilisationController(
    fertilisationService as never,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a fertilisation', async () => {
    fertilisationService.create.mockResolvedValue(
      fertilisation,
    );

    const dto = {
      name: 'Fertilisation Blé',
      product: 'NPK 15-15-15',
      type: FertilisationType.NPK,
      scheduledDate: '2026-10-25',
      quantity: '250.00',
      unit: FertilisationUnit.KG,
      applicationMethod:
        FertilisationApplicationMethod.BROADCAST,
      status: FertilisationStatus.PLANNED,
      notes: 'Application prévue après les semis',
      interventionId: 'intervention-1',
    };

    const result = await controller.create(dto, request as never);

    expect(result).toEqual(fertilisation);
    expect(fertilisationService.create).toHaveBeenCalledWith(
      dto,
      organizationId,
    );
  });

  it('should return all fertilisations', async () => {
    fertilisationService.findAll.mockResolvedValue([
      fertilisation,
    ]);

    const result = await controller.findAll(request as never);

    expect(result).toEqual([fertilisation]);
    expect(fertilisationService.findAll).toHaveBeenCalledWith(
      organizationId,
    );
  });

  it('should return one fertilisation', async () => {
    fertilisationService.findOne.mockResolvedValue(
      fertilisation,
    );

    const result = await controller.findOne(
      fertilisationId,
      request as never,
    );

    expect(result).toEqual(fertilisation);
    expect(fertilisationService.findOne).toHaveBeenCalledWith(
      fertilisationId,
      organizationId,
    );
  });

  it('should update a fertilisation', async () => {
    const dto = {
      name: 'Fertilisation Blé Automne',
      quantity: '300.00',
      status: FertilisationStatus.COMPLETED,
    };

    fertilisationService.update.mockResolvedValue({
      ...fertilisation,
      ...dto,
    });

    const result = await controller.update(
      fertilisationId,
      dto,
      request as never,
    );

    expect(result.name).toBe('Fertilisation Blé Automne');
    expect(result.quantity).toBe('300.00');
    expect(result.status).toBe(
      FertilisationStatus.COMPLETED,
    );

    expect(fertilisationService.update).toHaveBeenCalledWith(
      fertilisationId,
      dto,
      organizationId,
    );
  });

  it('should remove a fertilisation', async () => {
    fertilisationService.remove.mockResolvedValue(undefined);

    const result = await controller.remove(
      fertilisationId,
      request as never,
    );

    expect(result).toBeUndefined();
    expect(fertilisationService.remove).toHaveBeenCalledWith(
      fertilisationId,
      organizationId,
    );
  });
});
