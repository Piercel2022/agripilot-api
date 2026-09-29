import { Test, TestingModule } from '@nestjs/testing';

import { OrganizationsController } from './organizations.controller.js';
import { OrganizationsService } from './organizations.service.js';

describe('OrganizationsController', () => {
  let controller: OrganizationsController;

  const organizationsService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [
        {
          provide: OrganizationsService,
          useValue: organizationsService,
        },
      ],
    }).compile();

    controller = module.get<OrganizationsController>(
      OrganizationsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an organization', async () => {
    const dto = {
      name: 'Ferme Demo',
      slug: 'ferme-demo',
    };

    organizationsService.create.mockResolvedValue({
      id: 'org-1',
      ...dto,
    });

    const result = await controller.create(dto);

    expect(organizationsService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      id: 'org-1',
      ...dto,
    });
  });

  it('should return all organizations', async () => {
    organizationsService.findAll.mockResolvedValue([]);

    await controller.findAll();

    expect(organizationsService.findAll).toHaveBeenCalled();
  });

  it('should return one organization', async () => {
    organizationsService.findOne.mockResolvedValue({
      id: 'org-1',
    });

    await controller.findOne('org-1');

    expect(organizationsService.findOne).toHaveBeenCalledWith(
      'org-1',
    );
  });

  it('should update an organization', async () => {
    const dto = {
      name: 'Updated Farm',
    };

    organizationsService.update.mockResolvedValue({
      id: 'org-1',
    });

    await controller.update('org-1', dto);

    expect(organizationsService.update).toHaveBeenCalledWith(
      'org-1',
      dto,
    );
  });

  it('should remove an organization', async () => {
    organizationsService.remove.mockResolvedValue(undefined);

    await controller.remove('org-1');

    expect(organizationsService.remove).toHaveBeenCalledWith(
      'org-1',
    );
  });
});
