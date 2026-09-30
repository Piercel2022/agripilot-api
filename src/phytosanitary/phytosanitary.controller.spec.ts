import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ApplicationMethod,
  PhytosanitaryStatus,
  TreatmentType,
  TreatmentUnit,
} from './entities/phytosanitary-treatment.entity.js';
import { PhytosanitaryController } from './phytosanitary.controller.js';

describe('PhytosanitaryController', () => {
  const organisationId = 'org-1';
  const treatmentId = 'treatment-1';
  const interventionId = 'intervention-1';

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
    intervention: {
      id: interventionId,
    },
  };

  const phytosanitaryService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  const controller = new PhytosanitaryController(
    phytosanitaryService as never,
  );

  const request = {
    user: {
      organization: {
        id: organisationId,
      },
    },
  } as never;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a phytosanitary treatment', async () => {
    phytosanitaryService.create.mockResolvedValue(treatment);

    const dto = {
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
    };

    const result = await controller.create(dto, request);

    expect(result).toEqual(treatment);
    expect(phytosanitaryService.create).toHaveBeenCalledWith(
      dto,
      organisationId,
    );
  });

  it('should return all phytosanitary treatments', async () => {
    phytosanitaryService.findAll.mockResolvedValue([treatment]);

    const result = await controller.findAll(request);

    expect(result).toEqual([treatment]);
    expect(phytosanitaryService.findAll).toHaveBeenCalledWith(
      organisationId,
    );
  });

  it('should return one phytosanitary treatment', async () => {
    phytosanitaryService.findOne.mockResolvedValue(treatment);

    const result = await controller.findOne(
      treatmentId,
      request,
    );

    expect(result).toEqual(treatment);
    expect(phytosanitaryService.findOne).toHaveBeenCalledWith(
      treatmentId,
      organisationId,
    );
  });

  it('should update a phytosanitary treatment', async () => {
    const dto = {
      name: 'Traitement fongicide blé automne',
      dose: '2.00',
    };

    phytosanitaryService.update.mockResolvedValue({
      ...treatment,
      ...dto,
    });

    const result = await controller.update(
      treatmentId,
      dto,
      request,
    );

    expect(result.name).toBe(
      'Traitement fongicide blé automne',
    );
    expect(result.dose).toBe('2.00');

    expect(phytosanitaryService.update).toHaveBeenCalledWith(
      treatmentId,
      dto,
      organisationId,
    );
  });

  it('should remove a phytosanitary treatment', async () => {
    phytosanitaryService.remove.mockResolvedValue(undefined);

    const result = await controller.remove(
      treatmentId,
      request,
    );

    expect(result).toBeUndefined();
    expect(phytosanitaryService.remove).toHaveBeenCalledWith(
      treatmentId,
      organisationId,
    );
  });
});
