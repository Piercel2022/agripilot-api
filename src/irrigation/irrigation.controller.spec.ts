import { Test, TestingModule } from '@nestjs/testing';
import { IrrigationController } from './irrigation.controller.js';
import { IrrigationService } from './irrigation.service.js';
import { IrrigationMethod, IrrigationStatus } from './entities/irrigation.entity.js';

describe('IrrigationController', () => {
  let controller: IrrigationController;

  const irrigationService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  const organizationId = 'org-1';

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IrrigationController],
      providers: [
        {
          provide: IrrigationService,
          useValue: irrigationService,
        },
      ],
    }).compile();

    controller = module.get<IrrigationController>(IrrigationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an irrigation', async () => {
    const dto = {
      name: 'Irrigation parcelle Nord',
      method: IrrigationMethod.SPRINKLER,
      durationMinutes: 90,
      waterVolumeLiters: '1250.50',
      status: IrrigationStatus.PLANNED,
      interventionId: 'intervention-1',
    };

    const result = {
      id: 'irrigation-1',
      ...dto,
    };

    irrigationService.create.mockResolvedValue(result);

    await expect(
      controller.create(dto, {
        user: {
          organization: {
            id: organizationId,
          },
        },
      } as any),
    ).resolves.toEqual(result);

    expect(irrigationService.create).toHaveBeenCalledWith(
      dto,
      organizationId,
    );
  });

  it('should return all irrigations', async () => {
    const result = [
      {
        id: 'irrigation-1',
        name: 'Irrigation parcelle Nord',
      },
    ];

    irrigationService.findAll.mockResolvedValue(result);

    await expect(
      controller.findAll({
        user: {
          organization: {
            id: organizationId,
          },
        },
      } as any),
    ).resolves.toEqual(result);

    expect(irrigationService.findAll).toHaveBeenCalledWith(
      organizationId,
    );
  });

  it('should return one irrigation', async () => {
    const result = {
      id: 'irrigation-1',
      name: 'Irrigation parcelle Nord',
    };

    irrigationService.findOne.mockResolvedValue(result);

    await expect(
      controller.findOne('irrigation-1', {
        user: {
          organization: {
            id: organizationId,
          },
        },
      } as any),
    ).resolves.toEqual(result);

    expect(irrigationService.findOne).toHaveBeenCalledWith(
      'irrigation-1',
      organizationId,
    );
  });

  it('should update an irrigation', async () => {
    const dto = {
      status: IrrigationStatus.COMPLETED,
      completedDate: '2026-10-20',
    };

    const result = {
      id: 'irrigation-1',
      ...dto,
    };

    irrigationService.update.mockResolvedValue(result);

    await expect(
      controller.update(
        'irrigation-1',
        dto,
        {
          user: {
            organization: {
              id: organizationId,
            },
          },
        } as any,
      ),
    ).resolves.toEqual(result);

    expect(irrigationService.update).toHaveBeenCalledWith(
      'irrigation-1',
      dto,
      organizationId,
    );
  });

  it('should remove an irrigation', async () => {
    irrigationService.remove.mockResolvedValue(undefined);

    await expect(
      controller.remove('irrigation-1', {
        user: {
          organization: {
            id: organizationId,
          },
        },
      } as any),
    ).resolves.toBeUndefined();

    expect(irrigationService.remove).toHaveBeenCalledWith(
      'irrigation-1',
      organizationId,
    );
  });
});
