import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Crop } from '../crops/entities/crop.entity.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { UpdateCampaignDto } from './dto/update-campaign.dto.js';
import { Campaign } from './entities/campaign.entity.js';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignsRepository: Repository<Campaign>,

    @InjectRepository(Crop)
    private readonly cropsRepository: Repository<Crop>,
  ) {}

  async create(
    createCampaignDto: CreateCampaignDto,
    organizationId: string,
  ) {
    const crop = await this.cropsRepository.findOne({
      where: {
        id: createCampaignDto.cropId,
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

    const campaign = this.campaignsRepository.create({
      name: createCampaignDto.name,
      season: createCampaignDto.season,
      startDate: createCampaignDto.startDate,
      endDate: createCampaignDto.endDate,
      status: createCampaignDto.status,
      notes: createCampaignDto.notes,
      crop,
    });

    return this.campaignsRepository.save(campaign);
  }

  async findAll(organizationId: string) {
    return this.campaignsRepository.find({
      where: {
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
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(
    id: string,
    organizationId: string,
  ) {
    const campaign = await this.campaignsRepository.findOne({
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
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async update(
    id: string,
    updateCampaignDto: UpdateCampaignDto,
    organizationId: string,
  ) {
    const campaign = await this.findOne(
      id,
      organizationId,
    );

    campaign.name =
      updateCampaignDto.name ?? campaign.name;

    campaign.season =
      updateCampaignDto.season ?? campaign.season;

    campaign.startDate =
      updateCampaignDto.startDate ?? campaign.startDate;

    campaign.endDate =
      updateCampaignDto.endDate ?? campaign.endDate;

    campaign.status =
      updateCampaignDto.status ?? campaign.status;

    campaign.notes =
      updateCampaignDto.notes ?? campaign.notes;

    return this.campaignsRepository.save(campaign);
  }

  async remove(
    id: string,
    organizationId: string,
  ): Promise<void> {
    const campaign = await this.findOne(
      id,
      organizationId,
    );

    await this.campaignsRepository.remove(campaign);
  }
}
