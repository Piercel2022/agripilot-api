import { describe, expect, it, vi } from 'vitest';

import {
  FertilisationApplicationMethod,
  FertilisationStatus,
  FertilisationType,
  FertilisationUnit,
} from './entities/fertilisation.entity.js';
import { FertilisationService } from './fertilisation.service.js';

describe('FertilisationService', () => {
  const organisationId = 'org-1';
  const otherOrganisationId = 'org-2';
  const interventionId = 'intervention-1';
  const fertilisationId = 'fertilisation-1';

  const intervention = {
    id: interventionId,
    campaign: {
      crop: {
        field: {
          farm: {
            organization: {
              id: organisationId,
            },
          },
        },
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
    intervention,
  };

  const fertilisationRepository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    remove: vi.fn(),
  };

  const interventionsRepository = {
    findOne: vi.fn(),
  };

  const service = new FertilisationService(
    fertilisationRepository as never,
    interventionsRepository as never,
  );

  beforeEach(() => {
  vi.clearAllMocks();
  });

  it('should create a fertilisation', async () => {
    interventionsRepository.findOne.mockResolvedValue(intervention);
    fertilisationRepository.create.mockReturnValue(fertilisation);
    fertilisationRepository.save.mockResolvedValue(fertilisation);

    const result = await service.create(
      {
        name: 'Fertilisation Blé',
        product: 'NPK 15-15-15',
        type: FertilisationType.NPK,
        scheduledDate: '2026-10-25',
        quantity: '250.00',
        unit: FertilisationUnit.KG,
        applicationMethod: FertilisationApplicationMethod.BROADCAST,
        status: FertilisationStatus.PLANNED,
        notes: 'Application prévue après les semis',
        interventionId,
      },
      organisationId,
    );

    expect(result).toEqual(fertilisation);
    expect(interventionsRepository.findOne).toHaveBeenCalled();
    expect(fertilisationRepository.create).toHaveBeenCalled();
    expect(fertilisationRepository.save).toHaveBeenCalledWith(
      fertilisation,
    );
  });

  it('should throw when intervention does not belong to organization', async () => {
    interventionsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create(
        {
          name: 'Fertilisation',
          product: 'NPK',
          type: FertilisationType.NPK,
          interventionId,
        },
        otherOrganisationId,
      ),
    ).rejects.toThrow('Intervention not found');

    expect(fertilisationRepository.create).not.toHaveBeenCalled();
    expect(fertilisationRepository.save).not.toHaveBeenCalled();
  });

  it('should return all fertilisations for an organization', async () => {
    fertilisationRepository.find.mockResolvedValue([
      fertilisation,
    ]);

    const result = await service.findAll(organisationId);

    expect(result).toEqual([fertilisation]);
    expect(fertilisationRepository.find).toHaveBeenCalled();
  });

  it('should return an empty list when organization has no fertilisations', async () => {
    fertilisationRepository.find.mockResolvedValue([]);

    const result = await service.findAll(organisationId);

    expect(result).toEqual([]);
  });

  it('should return one fertilisation', async () => {
    fertilisationRepository.findOne.mockResolvedValue(fertilisation);

    const result = await service.findOne(
      fertilisationId,
      organisationId,
    );

    expect(result).toEqual(fertilisation);
    expect(fertilisationRepository.findOne).toHaveBeenCalled();
  });

  it('should throw when fertilisation is not found', async () => {
    fertilisationRepository.findOne.mockResolvedValue(null);

    await expect(
      service.findOne(fertilisationId, organisationId),
    ).rejects.toThrow('Fertilisation not found');
  });

  it('should update a fertilisation', async () => {
    const existing = {
      ...fertilisation,
    };

    fertilisationRepository.findOne.mockResolvedValue(existing);
    fertilisationRepository.save.mockResolvedValue({
      ...existing,
      name: 'Fertilisation Blé Automne',
      quantity: '300.00',
      status: FertilisationStatus.COMPLETED,
    });

    const result = await service.update(
      fertilisationId,
      {
        name: 'Fertilisation Blé Automne',
        quantity: '300.00',
        status: FertilisationStatus.COMPLETED,
      },
      organisationId,
    );

    expect(result.name).toBe('Fertilisation Blé Automne');
    expect(result.quantity).toBe('300.00');
    expect(result.status).toBe(FertilisationStatus.COMPLETED);
    expect(fertilisationRepository.save).toHaveBeenCalled();
  });

  it('should not update a fertilisation outside organization', async () => {
    fertilisationRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update(
        fertilisationId,
        {
          name: 'Modification interdite',
        },
        otherOrganisationId,
      ),
    ).rejects.toThrow('Fertilisation not found');

    expect(fertilisationRepository.save).not.toHaveBeenCalled();
  });

  it('should remove a fertilisation', async () => {
    fertilisationRepository.findOne.mockResolvedValue(
      fertilisation,
    );
    fertilisationRepository.remove.mockResolvedValue(fertilisation);

    await service.remove(
      fertilisationId,
      organisationId,
    );

    expect(fertilisationRepository.remove).toHaveBeenCalledWith(
      fertilisation,
    );
  });

  it('should not remove a fertilisation outside organization', async () => {
    fertilisationRepository.findOne.mockResolvedValue(null);

    await expect(
      service.remove(
        fertilisationId,
        otherOrganisationId,
      ),
    ).rejects.toThrow('Fertilisation not found');

    expect(fertilisationRepository.remove).not.toHaveBeenCalled();
  });
});
