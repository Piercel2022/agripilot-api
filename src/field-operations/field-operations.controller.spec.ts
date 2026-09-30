import { describe, expect, it, vi } from 'vitest';

import { FieldOperationsController } from './field-operations.controller.js';

describe('FieldOperationsController', () => {
  const fieldOperationsService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  const controller = new FieldOperationsController(
    fieldOperationsService as any,
  );

  const request = {
    user: {
      id: 'user-1',
      firstName: 'Pierre',
      lastName: 'Moussa',
      email: 'pierre@example.com',
      role: 'member',
      organization: {
        id: 'organization-1',
        name: 'AgriPilot Demo',
        slug: 'agripilot-demo',
      },
    },
  } as any;

  it('should create a field operation', async () => {
    const dto = {
      interventionId: 'intervention-1',
    };

    const expected = {
      id: 'operation-1',
    };

    fieldOperationsService.create.mockResolvedValue(expected);

    const result = await controller.create(dto, request);

    expect(result).toEqual(expected);
    expect(fieldOperationsService.create).toHaveBeenCalledWith(
      dto,
      'organization-1',
    );
  });

  it('should return all field operations', async () => {
    const expected = [
      {
        id: 'operation-1',
      },
    ];

    fieldOperationsService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll(request);

    expect(result).toEqual(expected);
    expect(fieldOperationsService.findAll).toHaveBeenCalledWith(
      'organization-1',
    );
  });

  it('should return one field operation', async () => {
    const expected = {
      id: 'operation-1',
    };

    fieldOperationsService.findOne.mockResolvedValue(expected);

    const result = await controller.findOne(
      'operation-1',
      request,
    );

    expect(result).toEqual(expected);
    expect(fieldOperationsService.findOne).toHaveBeenCalledWith(
      'operation-1',
      'organization-1',
    );
  });

  it('should update a field operation', async () => {
    const dto = {
      durationMinutes: 120,
    };

    const expected = {
      id: 'operation-1',
      durationMinutes: 120,
    };

    fieldOperationsService.update.mockResolvedValue(expected);

    const result = await controller.update(
      'operation-1',
      dto,
      request,
    );

    expect(result).toEqual(expected);
    expect(fieldOperationsService.update).toHaveBeenCalledWith(
      'operation-1',
      dto,
      'organization-1',
    );
  });

  it('should remove a field operation', async () => {
    fieldOperationsService.remove.mockResolvedValue(undefined);

    const result = await controller.remove(
      'operation-1',
      request,
    );

    expect(result).toBeUndefined();
    expect(fieldOperationsService.remove).toHaveBeenCalledWith(
      'operation-1',
      'organization-1',
    );
  });
});
