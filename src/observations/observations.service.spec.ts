import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotFoundException } from '@nestjs/common';

import { ObservationsService } from './observations.service.js';
import {
  ObservationSeverity,
  ObservationType,
} from './entities/observation.entity.js';

describe('ObservationsService', () => {
  const observationRepository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    remove: vi.fn(),
  };

  const fieldRepository = {
    findOne: vi.fn(),
  };

  let service: ObservationsService;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new ObservationsService(
      observationRepository as never,
      fieldRepository as never,
    );
  });

  describe('create', () => {
    it('creates an observation for a field in the organization', async () => {
      const field = {
        id: 'field-1',
        farm: {
          id: 'farm-1',
        },
      };

      const dto = {
        name: 'Stress hydrique',
        type: ObservationType.CROP,
        observedAt: '2026-10-20',
        severity: ObservationSeverity.MEDIUM,
        description: 'Les feuilles commencent à jaunir.',
        notes: 'Surveillance recommandée.',
        fieldId: 'field-1',
      };

      const observation = {
        id: 'observation-1',
        ...dto,
        field,
      };

      fieldRepository.findOne.mockResolvedValue(field);
      observationRepository.create.mockReturnValue(observation);
      observationRepository.save.mockResolvedValue(observation);

      const result = await service.create(dto, 'organization-1');

      expect(fieldRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'field-1',
          farm: {
            organization: {
              id: 'organization-1',
            },
          },
        },
        relations: {
          farm: true,
        },
      });

      expect(observationRepository.create).toHaveBeenCalledWith({
        name: 'Stress hydrique',
        type: ObservationType.CROP,
        observedAt: '2026-10-20',
        severity: ObservationSeverity.MEDIUM,
        description: 'Les feuilles commencent à jaunir.',
        notes: 'Surveillance recommandée.',
        field,
      });

      expect(result).toEqual(observation);
    });

    it('throws when the field does not belong to the organization', async () => {
      fieldRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(
          {
            name: 'Observation inaccessible',
            type: ObservationType.GENERAL,
            fieldId: 'field-other-org',
          },
          'organization-1',
        ),
      ).rejects.toThrow(new NotFoundException('Field not found'));

      expect(observationRepository.create).not.toHaveBeenCalled();
      expect(observationRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns observations for the organization', async () => {
      const observations = [
        {
          id: 'observation-1',
          name: 'Maladie détectée',
        },
      ];

      observationRepository.find.mockResolvedValue(observations);

      const result = await service.findAll('organization-1');

      expect(observationRepository.find).toHaveBeenCalledWith({
        where: {
          field: {
            farm: {
              organization: {
                id: 'organization-1',
              },
            },
          },
        },
        relations: {
          field: {
            farm: true,
          },
        },
        order: {
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual(observations);
    });

    it('returns an empty array when there are no observations', async () => {
      observationRepository.find.mockResolvedValue([]);

      const result = await service.findAll('organization-1');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('returns an observation belonging to the organization', async () => {
      const observation = {
        id: 'observation-1',
        name: 'Observation parcelle Nord',
      };

      observationRepository.findOne.mockResolvedValue(observation);

      const result = await service.findOne(
        'observation-1',
        'organization-1',
      );

      expect(observationRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'observation-1',
          field: {
            farm: {
              organization: {
                id: 'organization-1',
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

      expect(result).toEqual(observation);
    });

    it('throws when the observation does not exist or is outside the organization', async () => {
      observationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('observation-other-org', 'organization-1'),
      ).rejects.toThrow(
        new NotFoundException('Observation not found'),
      );
    });
  });

  describe('update', () => {
    it('updates an observation belonging to the organization', async () => {
      const observation = {
        id: 'observation-1',
        name: 'Ancien nom',
        type: ObservationType.GENERAL,
        observedAt: '2026-10-20',
        severity: ObservationSeverity.LOW,
        description: 'Ancienne description',
        notes: 'Anciennes notes',
      };

      observationRepository.findOne.mockResolvedValue(observation);
      observationRepository.save.mockResolvedValue({
        ...observation,
        name: 'Maladie du blé',
        type: ObservationType.DISEASE,
        severity: ObservationSeverity.HIGH,
      });

      const result = await service.update(
        'observation-1',
        {
          name: 'Maladie du blé',
          type: ObservationType.DISEASE,
          severity: ObservationSeverity.HIGH,
        },
        'organization-1',
      );

      expect(observationRepository.save).toHaveBeenCalledWith(
        observation,
      );

      expect(observation.name).toBe('Maladie du blé');
      expect(observation.type).toBe(ObservationType.DISEASE);
      expect(observation.severity).toBe(
        ObservationSeverity.HIGH,
      );

      expect(result).toEqual({
        ...observation,
        name: 'Maladie du blé',
        type: ObservationType.DISEASE,
        severity: ObservationSeverity.HIGH,
      });
    });

    it('throws when updating an observation outside the organization', async () => {
      observationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(
          'observation-other-org',
          {
            name: 'Modification interdite',
          },
          'organization-1',
        ),
      ).rejects.toThrow(
        new NotFoundException('Observation not found'),
      );

      expect(observationRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('removes an observation belonging to the organization', async () => {
      const observation = {
        id: 'observation-1',
        name: 'Observation à supprimer',
      };

      observationRepository.findOne.mockResolvedValue(observation);
      observationRepository.remove.mockResolvedValue(observation);

      await service.remove('observation-1', 'organization-1');

      expect(observationRepository.remove).toHaveBeenCalledWith(
        observation,
      );
    });

    it('throws when removing an observation outside the organization', async () => {
      observationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove(
          'observation-other-org',
          'organization-1',
        ),
      ).rejects.toThrow(
        new NotFoundException('Observation not found'),
      );

      expect(observationRepository.remove).not.toHaveBeenCalled();
    });
  });
});
