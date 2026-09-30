import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Intervention } from '../interventions/entities/intervention.entity.js';
import { CreateIrrigationDto } from './dto/create-irrigation.dto.js';
import { UpdateIrrigationDto } from './dto/update-irrigation.dto.js';
import { Irrigation } from './entities/irrigation.entity.js';

@Injectable()
export class IrrigationService {
  constructor(
    @InjectRepository(Irrigation)
    private readonly irrigationRepository: Repository<Irrigation>,

    @InjectRepository(Intervention)
    private readonly interventionsRepository: Repository<Intervention>,
  ) {}

  async create(
    createIrrigationDto: CreateIrrigationDto,
    organizationId: string,
  ) {
    const intervention = await this.interventionsRepository.findOne({
      where: {
        id: createIrrigationDto.interventionId,
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

    const irrigation = this.irrigationRepository.create({
      name: createIrrigationDto.name,
      method: createIrrigationDto.method,
      scheduledDate: createIrrigationDto.scheduledDate,
      completedDate: createIrrigationDto.completedDate,
      durationMinutes: createIrrigationDto.durationMinutes,
      waterVolumeLiters: createIrrigationDto.waterVolumeLiters,
      status: createIrrigationDto.status,
      notes: createIrrigationDto.notes,
      intervention,
    });

    return this.irrigationRepository.save(irrigation);
  }

  async findAll(organizationId: string) {
    return this.irrigationRepository.find({
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
  }

  async findOne(id: string, organizationId: string) {
    const irrigation = await this.irrigationRepository.findOne({
      where: {
        id,
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

    if (!irrigation) {
      throw new NotFoundException('Irrigation not found');
    }

    return irrigation;
  }

  async update(
    id: string,
    updateIrrigationDto: UpdateIrrigationDto,
    organizationId: string,
  ) {
    const irrigation = await this.findOne(id, organizationId);

    irrigation.name = updateIrrigationDto.name ?? irrigation.name;
    irrigation.method = updateIrrigationDto.method ?? irrigation.method;
    irrigation.scheduledDate =
      updateIrrigationDto.scheduledDate ?? irrigation.scheduledDate;
    irrigation.completedDate =
      updateIrrigationDto.completedDate ?? irrigation.completedDate;
    irrigation.durationMinutes =
      updateIrrigationDto.durationMinutes ?? irrigation.durationMinutes;
    irrigation.waterVolumeLiters =
      updateIrrigationDto.waterVolumeLiters ?? irrigation.waterVolumeLiters;
    irrigation.status =
      updateIrrigationDto.status ?? irrigation.status;
    irrigation.notes =
      updateIrrigationDto.notes ?? irrigation.notes;

    return this.irrigationRepository.save(irrigation);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const irrigation = await this.findOne(id, organizationId);

    await this.irrigationRepository.remove(irrigation);
  }
}
