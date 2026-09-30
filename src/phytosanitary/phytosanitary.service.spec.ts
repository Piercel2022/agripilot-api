import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ApplicationMethod,
  PhytosanitaryStatus,
  TreatmentType,
  TreatmentUnit,
} from './entities/phytosanitary-treatment.entity.js';
import { PhytosanitaryService } from './phytosanitary.service.js';

describe('PhytosanitaryService', () => {
  const organisationId = 'org-1';
  const otherOrganisationId = 'org-2';
  const interventionId = 'intervention-1';
  const treatmentId = 'treatment-1';

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

  const treatment = {
    id: treatmentId,
    name: 'Traitement fongicide blé',
    product: 'Produit Fongicide',
    activeIngredient: 'Tebuconazole',
    treatmentType: TreatmentType.FUNGICIDE,
    scheduledDate: '2026-10-25',
    completedDate: undefined,
    dose: '1.50',
    unit: TreatmentUnit.LITER_PER_HECTARE,
    target: 'Maladies fongiques',
    applicationMethod: ApplicationMethod.FOLIAR,
    status: PhytosanitaryStatus.PLANNED,
    notes: 'Application préventive',
    intervention,
  };

  const phytosanitaryRepository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    remove: vi.fn(),
  };

  const interventionsRepository = {
    findOne: vi.fn(),
  };

  const service = new PhytosanitaryService(
    phytosanitaryRepository as never,
    interventionsRepository as never,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a phytosanitary treatment', async () => {
    interventionsRepository.findOne.mockResolvedValue(intervention);
    phytosanitaryRepository.create.mockReturnValue(treatment);
    phytosanitaryRepository.save.mockResolvedValue(treatment);

    const result = await service.create(
      {
        interventionId,
        name: 'Traitement fongicide blé',
        product: 'Produit Fongicide',
        activeIngredient: 'Tebuconazole',
        treatmentType: TreatmentType.FUNGICIDE,
        scheduledDate: '2026-10-25',
        dose: '1.50',
        unit: TreatmentUnit.LITER_PER_HECTARE,
        target: 'Maladies fongiques',
        applicationMethod: ApplicationMethod.FOLIAR,
        notes: 'Application préventive',
      },
      organisationId,
    );

    expect(result).toEqual(treatment);
    expect(interventionsRepository.findOne).toHaveBeenCalled();
    expect(phytosanitaryRepository.create).toHaveBeenCalled();
    expect(phytosanitaryRepository.save).toHaveBeenCalledWith(
      treatment,
    );
  });

  it('should throw when intervention does not belong to organization', async () => {
    interventionsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create(
        {
          interventionId,
          name: 'Traitement fongicide',
          product: 'Produit Fongicide',
          treatmentType: TreatmentType.FUNGICIDE,
        },
        otherOrganisationId,
      ),
    ).rejects.toThrow('Intervention not found');

    expect(phytosanitaryRepository.create).not.toHaveBeenCalled();
    expect(phytosanitaryRepository.save).not.toHaveBeenCalled();
  });

  it('should return all phytosanitary treatments for an organization', async () => {
    phytosanitaryRepository.find.mockResolvedValue([treatment]);

    const result = await service.findAll(organisationId);

    expect(result).toEqual([treatment]);
    expect(phytosanitaryRepository.find).toHaveBeenCalled();
  });

  it('should return an empty list when organization has no treatments', async () => {
    phytosanitaryRepository.find.mockResolvedValue([]);

    const result = await service.findAll(organisationId);

    expect(result).toEqual([]);
  });

  it('should return one phytosanitary treatment', async () => {
    phytosanitaryRepository.findOne.mockResolvedValue(treatment);

    const result = await service.findOne(
      treatmentId,
      organisationId,
    );

    expect(result).toEqual(treatment);
    expect(phytosanitaryRepository.findOne).toHaveBeenCalled();
  });

  it('should throw when phytosanitary treatment is not found', async () => {
    phytosanitaryRepository.findOne.mockResolvedValue(null);

    await expect(
      service.findOne(treatmentId, organisationId),
    ).rejects.toThrow('Phytosanitary treatment not found');
  });

  it('should update a phytosanitary treatment', async () => {
    const existing = {
      ...treatment,
    };

    phytosanitaryRepository.findOne.mockResolvedValue(existing);
    phytosanitaryRepository.save.mockResolvedValue({
      ...existing,
      name: 'Traitement fongicide blé automne',
      dose: '2.00',
      status: PhytosanitaryStatus.COMPLETED,
    });

    const result = await service.update(
      treatmentId,
      {
        name: 'Traitement fongicide blé automne',
        dose: '2.00',
      },
      organisationId,
    );

    existing.status = PhytosanitaryStatus.COMPLETED;

    expect(result.name).toBe(
      'Traitement fongicide blé automne',
    );
    expect(result.dose).toBe('2.00');
    expect(phytosanitaryRepository.save).toHaveBeenCalled();
  });

  it('should not update a treatment outside organization', async () => {
    phytosanitaryRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update(
        treatmentId,
        {
          name: 'Modification interdite',
        },
        otherOrganisationId,
      ),
    ).rejects.toThrow('Phytosanitary treatment not found');

    expect(phytosanitaryRepository.save).not.toHaveBeenCalled();
  });

  it('should remove a phytosanitary treatment', async () => {
    phytosanitaryRepository.findOne.mockResolvedValue(
      treatment,
    );
    phytosanitaryRepository.remove.mockResolvedValue(treatment);

    await service.remove(
      treatmentId,
      organisationId,
    );

    expect(phytosanitaryRepository.remove).toHaveBeenCalledWith(
      treatment,
    );
  });

  it('should not remove a treatment outside organization', async () => {
    phytosanitaryRepository.findOne.mockResolvedValue(null);

    await expect(
      service.remove(
        treatmentId,
        otherOrganisationId,
      ),
    ).rejects.toThrow('Phytosanitary treatment not found');

    expect(phytosanitaryRepository.remove).not.toHaveBeenCalled();
  });
});
