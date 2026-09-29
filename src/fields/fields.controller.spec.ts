import { Test, TestingModule } from '@nestjs/testing';

import { CreateFieldDto } from './dto/create-field.dto.js';
import { UpdateFieldDto } from './dto/update-field.dto.js';
import { FieldsController } from './fields.controller.js';
import { FieldsService } from './fields.service.js';

describe('FieldsController', () => {
  let controller: FieldsController;

  const fieldsService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

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

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FieldsController],
      providers: [
        {
          provide: FieldsService,
          useValue: fieldsService,
        },
      ],
    }).compile();

    controller =
      module.get<FieldsController>(FieldsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a field using the authenticated organization', async () => {
    const dto: CreateFieldDto = {
      farmId: 'farm-1',
      name: 'Parcelle Nord',
      areaHectares: 12.5,
      soilType: 'Limoneux',
      cropType: 'Blé',
    };

    const expected = {
      id: 'field-1',
      ...dto,
    };

    fieldsService.create.mockResolvedValue(expected);

    const result = await controller.create(
      dto,
      request,
    );

    expect(fieldsService.create).toHaveBeenCalledWith(
      dto,
      organizationId,
    );

    expect(result).toEqual(expected);
  });

  it('should return fields for the authenticated organization', async () => {
    const expected = [
      {
        id: 'field-1',
        name: 'Parcelle Nord',
      },
    ];

    fieldsService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll(request);

    expect(fieldsService.findAll).toHaveBeenCalledWith(
      organizationId,
    );

    expect(result).toEqual(expected);
  });

  it('should return one field using the authenticated organization', async () => {
    const expected = {
      id: 'field-1',
      name: 'Parcelle Nord',
    };

    fieldsService.findOne.mockResolvedValue(expected);

    const result = await controller.findOne(
      'field-1',
      request,
    );

    expect(fieldsService.findOne).toHaveBeenCalledWith(
      'field-1',
      organizationId,
    );

    expect(result).toEqual(expected);
  });

  it('should update a field using the authenticated organization', async () => {
    const dto: UpdateFieldDto = {
      cropType: 'Maïs',
    };

    const expected = {
      id: 'field-1',
      cropType: 'Maïs',
    };

    fieldsService.update.mockResolvedValue(expected);

    const result = await controller.update(
      'field-1',
      dto,
      request,
    );

    expect(fieldsService.update).toHaveBeenCalledWith(
      'field-1',
      dto,
      organizationId,
    );

    expect(result).toEqual(expected);
  });

  it('should remove a field using the authenticated organization', async () => {
    fieldsService.remove.mockResolvedValue(undefined);

    const result = await controller.remove(
      'field-1',
      request,
    );

    expect(fieldsService.remove).toHaveBeenCalledWith(
      'field-1',
      organizationId,
    );

    expect(result).toBeUndefined();
  });
});
