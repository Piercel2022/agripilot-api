import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Intervention } from '../interventions/entities/intervention.entity.js';
import { CreateFertilisationDto } from './dto/create-fertilisation.dto.js';
import { UpdateFertilisationDto } from './dto/update-fertilisation.dto.js';
import { Fertilisation } from './entities/fertilisation.entity.js';

@Injectable()
export class FertilisationService {
  constructor(
    @InjectRepository(Fertilisation)
    private readonly fertilisationRepository: Repository<Fertilisation>,

    @InjectRepository(Intervention)
    private readonly interventionsRepository: Repository<Intervention>,
  ) {}

  async create(
    createFertilisationDto: CreateFertilisationDto,
    organizationId: string,
  ) {
    const intervention = await this.interventionsRepository.findOne({
      where: {
        id: createFertilisationDto.interventionId,
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

    const fertilisation = this.fertilisationRepository.create({
      name: createFertilisationDto.name,
      product: createFertilisationDto.product,
      type: createFertilisationDto.type,
      scheduledDate: createFertilisationDto.scheduledDate,
      completedDate: createFertilisationDto.completedDate,
      quantity: createFertilisationDto.quantity,
      unit: createFertilisationDto.unit,
      applicationMethod: createFertilisationDto.applicationMethod,
      status: createFertilisationDto.status,
      notes: createFertilisationDto.notes,
      intervention,
    });

    return this.fertilisationRepository.save(fertilisation);
  }

  async findAll(organizationId: string) {
    return this.fertilisationRepository.find({
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
    const fertilisation = await this.fertilisationRepository.findOne({
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

    if (!fertilisation) {
      throw new NotFoundException('Fertilisation not found');
    }

    return fertilisation;
  }

  async update(
    id: string,
    updateFertilisationDto: UpdateFertilisationDto,
    organizationId: string,
  ) {
    const fertilisation = await this.findOne(id, organizationId);

    fertilisation.name =
      updateFertilisationDto.name ?? fertilisation.name;

    fertilisation.product =
      updateFertilisationDto.product ?? fertilisation.product;

    fertilisation.type =
      updateFertilisationDto.type ?? fertilisation.type;

    fertilisation.scheduledDate =
      updateFertilisationDto.scheduledDate ??
      fertilisation.scheduledDate;

    fertilisation.completedDate =
      updateFertilisationDto.completedDate ??
      fertilisation.completedDate;

    fertilisation.quantity =
      updateFertilisationDto.quantity ??
      fertilisation.quantity;

    fertilisation.unit =
      updateFertilisationDto.unit ?? fertilisation.unit;

    fertilisation.applicationMethod =
      updateFertilisationDto.applicationMethod ??
      fertilisation.applicationMethod;

    fertilisation.status =
      updateFertilisationDto.status ??
      fertilisation.status;

    fertilisation.notes =
      updateFertilisationDto.notes ?? fertilisation.notes;

    return this.fertilisationRepository.save(fertilisation);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const fertilisation = await this.findOne(id, organizationId);

    await this.fertilisationRepository.remove(fertilisation);
  }
}
