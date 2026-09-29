import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Campaign } from '../campaigns/entities/campaign.entity.js';
import { CreateInterventionDto } from './dto/create-intervention.dto.js';
import { UpdateInterventionDto } from './dto/update-intervention.dto.js';
import { Intervention } from './entities/intervention.entity.js';

@Injectable()
export class InterventionsService {
  constructor(
    @InjectRepository(Intervention)
    private readonly interventionsRepository: Repository<Intervention>,

    @InjectRepository(Campaign)
    private readonly campaignsRepository: Repository<Campaign>,
  ) {}

  async create(
    createInterventionDto: CreateInterventionDto,
    organizationId: string,
  ) {
    const campaign = await this.campaignsRepository.findOne({
      where: {
        id: createInterventionDto.campaignId,
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

    const intervention = this.interventionsRepository.create({
      name: createInterventionDto.name,
      type: createInterventionDto.type,
      scheduledDate: createInterventionDto.scheduledDate,
      completedDate: createInterventionDto.completedDate,
      status: createInterventionDto.status,
      notes: createInterventionDto.notes,
      campaign,
    });

    return this.interventionsRepository.save(intervention);
  }

  async findAll(organizationId: string) {
    return this.interventionsRepository.find({
      where: {
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
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const intervention = await this.interventionsRepository.findOne({
      where: {
        id,
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

    if (!intervention) {
      throw new NotFoundException('Intervention not found');
    }

    return intervention;
  }

  async update(
    id: string,
    updateInterventionDto: UpdateInterventionDto,
    organizationId: string,
  ) {
    const intervention = await this.findOne(id, organizationId);

    intervention.name = updateInterventionDto.name ?? intervention.name;
    intervention.type = updateInterventionDto.type ?? intervention.type;
    intervention.scheduledDate =
      updateInterventionDto.scheduledDate ?? intervention.scheduledDate;
    intervention.completedDate =
      updateInterventionDto.completedDate ?? intervention.completedDate;
    intervention.status =
      updateInterventionDto.status ?? intervention.status;
    intervention.notes =
      updateInterventionDto.notes ?? intervention.notes;

    return this.interventionsRepository.save(intervention);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const intervention = await this.findOne(id, organizationId);

    await this.interventionsRepository.remove(intervention);
  }
}
