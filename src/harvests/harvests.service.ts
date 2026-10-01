import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Campaign } from '../campaigns/entities/campaign.entity.js';
import { Crop } from '../crops/entities/crop.entity.js';
import { CreateHarvestDto } from './dto/create-harvest.dto.js';
import { UpdateHarvestDto } from './dto/update-harvest.dto.js';
import { Harvest } from './entities/harvest.entity.js';

@Injectable()
export class HarvestsService {
  constructor(
    @InjectRepository(Harvest)
    private readonly harvestsRepository: Repository<Harvest>,

    @InjectRepository(Crop)
    private readonly cropsRepository: Repository<Crop>,

    @InjectRepository(Campaign)
    private readonly campaignsRepository: Repository<Campaign>,
  ) {}

  async create(
    createHarvestDto: CreateHarvestDto,
    organizationId: string,
  ) {
    const crop = await this.cropsRepository.findOne({
      where: {
        id: createHarvestDto.cropId,
        field: {
          farm: {
            organization: {
              id: organizationId,
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

    if (!crop) {
      throw new NotFoundException('Crop not found');
    }

    const campaign = await this.campaignsRepository.findOne({
      where: {
        id: createHarvestDto.campaignId,
        crop: {
          id: crop.id,
          field: {
            farm: {
              organization: {
                id: organizationId,
              },
            },
          },
        },
      },
      relations: {
        crop: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.crop.id !== crop.id) {
      throw new BadRequestException(
        'Campaign does not belong to the selected crop',
      );
    }

    const harvest = this.harvestsRepository.create({
      crop,
      campaign,
      harvestDate: createHarvestDto.harvestDate,
      quantity: createHarvestDto.quantity,
      unit: createHarvestDto.unit,
      yield: createHarvestDto.yield,
      quality: createHarvestDto.quality,
      notes: createHarvestDto.notes,
    });

    return this.harvestsRepository.save(harvest);
  }

  async findAll(
    organizationId: string,
    cropId?: string,
    campaignId?: string,
  ) {
    return this.harvestsRepository.find({
      where: {
        crop: {
          ...(cropId ? { id: cropId } : {}),
          field: {
            farm: {
              organization: {
                id: organizationId,
              },
            },
          },
        },
        ...(campaignId
          ? {
              campaign: {
                id: campaignId,
              },
            }
          : {}),
      },
      relations: {
        crop: {
          field: {
            farm: true,
          },
        },
        campaign: {
          crop: true,
        },
      },
      order: {
        harvestDate: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(
    id: string,
    organizationId: string,
  ) {
    const harvest = await this.harvestsRepository.findOne({
      where: {
        id,
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
      relations: {
        crop: {
          field: {
            farm: true,
          },
        },
        campaign: {
          crop: true,
        },
      },
    });

    if (!harvest) {
      throw new NotFoundException('Harvest not found');
    }

    return harvest;
  }

  async update(
    id: string,
    updateHarvestDto: UpdateHarvestDto,
    organizationId: string,
  ) {
    const harvest = await this.findOne(
      id,
      organizationId,
    );

    if (updateHarvestDto.cropId) {
      const crop = await this.cropsRepository.findOne({
        where: {
          id: updateHarvestDto.cropId,
          field: {
            farm: {
              organization: {
                id: organizationId,
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

      if (!crop) {
        throw new NotFoundException('Crop not found');
      }

      harvest.crop = crop;
    }

    if (updateHarvestDto.campaignId) {
      const campaign = await this.campaignsRepository.findOne({
        where: {
          id: updateHarvestDto.campaignId,
          crop: {
            id: harvest.crop.id,
            field: {
              farm: {
                organization: {
                  id: organizationId,
                },
              },
            },
          },
        },
        relations: {
          crop: true,
        },
      });

      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      harvest.campaign = campaign;
    }

    if (
      updateHarvestDto.cropId &&
      !updateHarvestDto.campaignId
    ) {
      const campaign = await this.campaignsRepository.findOne({
        where: {
          id: harvest.campaign.id,
          crop: {
            id: harvest.crop.id,
            field: {
              farm: {
                organization: {
                  id: organizationId,
                },
              },
            },
          },
        },
        relations: {
          crop: true,
        },
      });

      if (!campaign) {
        throw new BadRequestException(
          'Campaign does not belong to the selected crop',
        );
      }

      harvest.campaign = campaign;
    }

    harvest.harvestDate =
      updateHarvestDto.harvestDate ??
      harvest.harvestDate;

    harvest.quantity =
      updateHarvestDto.quantity ??
      harvest.quantity;

    harvest.unit =
      updateHarvestDto.unit ??
      harvest.unit;

    harvest.yield =
      updateHarvestDto.yield ??
      harvest.yield;

    harvest.quality =
      updateHarvestDto.quality ??
      harvest.quality;

    harvest.notes =
      updateHarvestDto.notes ??
      harvest.notes;

    return this.harvestsRepository.save(harvest);
  }

  async remove(
    id: string,
    organizationId: string,
  ): Promise<void> {
    const harvest = await this.findOne(
      id,
      organizationId,
    );

    await this.harvestsRepository.remove(harvest);
  }
}
