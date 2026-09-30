import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { FieldOperationsService } from './field-operations.service.js';
import {
  FieldOperationStatus,
} from './entities/field-operation.entity.js';

describe('FieldOperationsService', () => {
  const fieldOperationsRepository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    remove: vi.fn(),
  };

  const interventionsRepository = {
    findOne: vi.fn(),
  };

  const service = new FieldOperationsService(
    fieldOperationsRepository as any,
    interventionsRepository as any,
  );

  it('should create a field operation', async () => {
    const intervention = {
      id: 'intervention-1',
    };

    const fieldOperation = {
      id: 'operation-1',
      status: FieldOperationStatus.PLANNED,
      intervention,
    };

    interventionsRepository.findOne.mockResolvedValue(intervention);
    fieldOperationsRepository.create.mockReturnValue(fieldOperation);
    fieldOperationsRepository.save.mockResolvedValue(fieldOperation);

    const result = await service.create(
      {
        interventionId: 'intervention-1',
        status: FieldOperationStatus.PLANNED,
        durationMinutes: 120,
        notes: 'Travail réalisé sur la parcelle.',
      },
      'organization-1',
    );

    expect(result).toEqual(fieldOperation);
    expect(interventionsRepository.findOne).toHaveBeenCalled();
    expect(fieldOperationsRepository.create).toHaveBeenCalled();
    expect(fieldOperationsRepository.save).toHaveBeenCalledWith(
      fieldOperation,
    );
  });

  it('should throw when the intervention does not belong to the organization', async () => {
    interventionsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create(
        {
          interventionId: 'intervention-1',
        },
        'organization-1',
      ),
    ).rejects.toThrow(new NotFoundException('Intervention not found'));
  });

  it('should return all field operations for an organization', async () => {
    const fieldOperations = [
      {
        id: 'operation-1',
      },
    ];

    fieldOperationsRepository.find.mockResolvedValue(fieldOperations);

    const result = await service.findAll('organization-1');

    expect(result).toEqual(fieldOperations);
    expect(fieldOperationsRepository.find).toHaveBeenCalled();
  });

  it('should return one field operation', async () => {
    const fieldOperation = {
      id: 'operation-1',
    };

    fieldOperationsRepository.findOne.mockResolvedValue(fieldOperation);

    const result = await service.findOne(
      'operation-1',
      'organization-1',
    );

    expect(result).toEqual(fieldOperation);
  });

  it('should throw when the field operation does not exist', async () => {
    fieldOperationsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.findOne('operation-1', 'organization-1'),
    ).rejects.toThrow(
      new NotFoundException('Field operation not found'),
    );
  });

  it('should update a field operation', async () => {
    const fieldOperation = {
      id: 'operation-1',
      startedAt: undefined,
      completedAt: undefined,
      durationMinutes: 60,
      status: FieldOperationStatus.PLANNED,
      notes: 'Initial',
    };

    fieldOperationsRepository.findOne.mockResolvedValue(fieldOperation);
    fieldOperationsRepository.save.mockResolvedValue(fieldOperation);

    const result = await service.update(
      'operation-1',
      {
        durationMinutes: 120,
        status: FieldOperationStatus.COMPLETED,
        notes: 'Terminé.',
      },
      'organization-1',
    );

    expect(result).toEqual(fieldOperation);
    expect(fieldOperation.durationMinutes).toBe(120);
    expect(fieldOperation.status).toBe(
      FieldOperationStatus.COMPLETED,
    );
    expect(fieldOperation.notes).toBe('Terminé.');
    expect(fieldOperationsRepository.save).toHaveBeenCalledWith(
      fieldOperation,
    );
  });

  it('should remove a field operation', async () => {
    const fieldOperation = {
      id: 'operation-1',
    };

    fieldOperationsRepository.findOne.mockResolvedValue(fieldOperation);
    fieldOperationsRepository.remove.mockResolvedValue(fieldOperation);

    await service.remove('operation-1', 'organization-1');

    expect(fieldOperationsRepository.remove).toHaveBeenCalledWith(
      fieldOperation,
    );
  });
});
