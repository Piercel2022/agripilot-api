import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotFoundException } from '@nestjs/common';

import { IrrigationService } from './irrigation.service.js';
import {
  IrrigationMethod,
  IrrigationStatus,
} from './entities/irrigation.entity.js';

describe('IrrigationService', () => {
  const irrigationRepository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    remove: vi.fn(),
  };

  const interventionsRepository = {
    findOne: vi.fn(),
  };

  let service: IrrigationService;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new IrrigationService(
      irrigationRepository as never,
      interventionsRepository as never,
    );
  });

  const organizationId = 'organization-id';
  const interventionId = 'intervention-id';
  const irrigationId = 'irrigation-id';

  const intervention = {
    id: interventionId,
    campaign: {
      crop: {
        field: {
          farm: {
            id: 'farm-id',
          },
        },
      },
    },
  };

  const irrigation = {
    id: irrigationId,
    name: 'Irrigation parcelle Nord',
    method: IrrigationMethod.SPRINKLER,
    scheduledDate: '2026-10-20',
    completedDate: undefined,
    durationMinutes: 90,
    waterVolumeLiters: '1250.50',
    status: IrrigationStatus.PLANNED,
    notes: 'Irrigation de la parcelle Nord',
    intervention,
  };

  describe('create', () => {
    it('should create an irrigation for an intervention in the organization', async () => {
      interventionsRepository.findOne.mockResolvedValue(intervention);

      irrigationRepository.create.mockReturnValue(irrigation);
      irrigationRepository.save.mockResolvedValue(irrigation);

      const dto = {
        name: 'Irrigation parcelle Nord',
        method: IrrigationMethod.SPRINKLER,
        scheduledDate: '2026-10-20',
        durationMinutes: 90,
        waterVolumeLiters: '1250.50',
        status: IrrigationStatus.PLANNED,
        notes: 'Irrigation de la parcelle Nord',
        interventionId,
      };

      const result = await service.create(dto, organizationId);

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

      expect(irrigationRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        method: dto.method,
        scheduledDate: dto.scheduledDate,
        completedDate: undefined,
        durationMinutes: dto.durationMinutes,
        waterVolumeLiters: dto.waterVolumeLiters,
        status: dto.status,
        notes: dto.notes,
        intervention,
      });

      expect(irrigationRepository.save).toHaveBeenCalledWith(irrigation);
      expect(result).toEqual(irrigation);
    });

    it('should throw NotFoundException when the intervention does not exist', async () => {
      interventionsRepository.findOne.mockResolvedValue(null);

      const dto = {
        name: 'Irrigation parcelle Nord',
        method: IrrigationMethod.SPRINKLER,
        interventionId,
      };

      await expect(service.create(dto, organizationId)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(irrigationRepository.create).not.toHaveBeenCalled();
      expect(irrigationRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all irrigations for the organization', async () => {
      irrigationRepository.find.mockResolvedValue([irrigation]);

      const result = await service.findAll(organizationId);

      expect(irrigationRepository.find).toHaveBeenCalledWith({
        where: {
          intervention: {
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
        },
        relations: {
          intervention: {
            campaign: {
              crop: {
                field: {
                  farm: true,
                },
              },
            },
          },
        },
        order: {
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual([irrigation]);
    });

    it('should return an empty array when there are no irrigations', async () => {
      irrigationRepository.find.mockResolvedValue([]);

      const result = await service.findAll(organizationId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an irrigation belonging to the organization', async () => {
      irrigationRepository.findOne.mockResolvedValue(irrigation);

      const result = await service.findOne(irrigationId, organizationId);

      expect(irrigationRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: irrigationId,
          intervention: {
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
        },
        relations: {
          intervention: {
            campaign: {
              crop: {
                field: {
                  farm: true,
                },
              },
            },
          },
        },
      });

      expect(result).toEqual(irrigation);
    });

    it('should throw NotFoundException when the irrigation does not exist', async () => {
      irrigationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(irrigationId, organizationId),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an irrigation', async () => {
      const existingIrrigation = {
        ...irrigation,
      };

      irrigationRepository.findOne.mockResolvedValue(existingIrrigation);
      irrigationRepository.save.mockResolvedValue({
        ...existingIrrigation,
        status: IrrigationStatus.COMPLETED,
        completedDate: '2026-10-20',
        durationMinutes: 120,
        waterVolumeLiters: '1800.00',
        notes: 'Irrigation terminée',
      });

      const dto = {
        status: IrrigationStatus.COMPLETED,
        completedDate: '2026-10-20',
        durationMinutes: 120,
        waterVolumeLiters: '1800.00',
        notes: 'Irrigation terminée',
      };

      const result = await service.update(
        irrigationId,
        dto,
        organizationId,
      );

      expect(existingIrrigation.status).toBe(IrrigationStatus.COMPLETED);
      expect(existingIrrigation.completedDate).toBe('2026-10-20');
      expect(existingIrrigation.durationMinutes).toBe(120);
      expect(existingIrrigation.waterVolumeLiters).toBe('1800.00');
      expect(existingIrrigation.notes).toBe('Irrigation terminée');

      expect(irrigationRepository.save).toHaveBeenCalledWith(
        existingIrrigation,
      );

      expect(result.status).toBe(IrrigationStatus.COMPLETED);
      expect(result.completedDate).toBe('2026-10-20');
    });

    it('should throw NotFoundException when updating an irrigation outside the organization', async () => {
      irrigationRepository.findOne.mockResolvedValue(null);

      const dto = {
        status: IrrigationStatus.COMPLETED,
      };

      await expect(
        service.update(irrigationId, dto, organizationId),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(irrigationRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an irrigation belonging to the organization', async () => {
      irrigationRepository.findOne.mockResolvedValue(irrigation);
      irrigationRepository.remove.mockResolvedValue(irrigation);

      await service.remove(irrigationId, organizationId);

      expect(irrigationRepository.remove).toHaveBeenCalledWith(irrigation);
    });

    it('should throw NotFoundException when removing an irrigation outside the organization', async () => {
      irrigationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove(irrigationId, organizationId),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(irrigationRepository.remove).not.toHaveBeenCalled();
    });
  });
});
