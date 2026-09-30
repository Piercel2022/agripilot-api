import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Intervention } from '../interventions/entities/intervention.entity.js';
import { CreatePhytosanitaryTreatmentDto } from './dto/create-phytosanitary-treatment.dto.js';
import { UpdatePhytosanitaryTreatmentDto } from './dto/update-phytosanitary-treatment.dto.js';
import { PhytosanitaryTreatment } from './entities/phytosanitary-treatment.entity.js';

@Injectable()
export class PhytosanitaryService {
  constructor(
    @InjectRepository(PhytosanitaryTreatment)
    private readonly phytosanitaryRepository: Repository<PhytosanitaryTreatment>,

    @InjectRepository(Intervention)
    private readonly interventionsRepository: Repository<Intervention>,
  ) {}

  async create(
    createPhytosanitaryTreatmentDto: CreatePhytosanitaryTreatmentDto,
    organizationId: string,
  ) {
    const intervention = await this.interventionsRepository.findOne({
      where: {
        id: createPhytosanitaryTreatmentDto.interventionId,
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

    const treatment = this.phytosanitaryRepository.create({
      name: createPhytosanitaryTreatmentDto.name,
      product: createPhytosanitaryTreatmentDto.product,
      activeIngredient:
        createPhytosanitaryTreatmentDto.activeIngredient,
      treatmentType: createPhytosanitaryTreatmentDto.treatmentType,
      scheduledDate: createPhytosanitaryTreatmentDto.scheduledDate,
      completedDate: createPhytosanitaryTreatmentDto.completedDate,
      dose: createPhytosanitaryTreatmentDto.dose,
      unit: createPhytosanitaryTreatmentDto.unit,
      target: createPhytosanitaryTreatmentDto.target,
      applicationMethod:
        createPhytosanitaryTreatmentDto.applicationMethod,
      notes: createPhytosanitaryTreatmentDto.notes,
      intervention,
    });

    return this.phytosanitaryRepository.save(treatment);
  }

  async findAll(organizationId: string) {
    return this.phytosanitaryRepository.find({
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
    const treatment = await this.phytosanitaryRepository.findOne({
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

    if (!treatment) {
      throw new NotFoundException('Phytosanitary treatment not found');
    }

    return treatment;
  }

  async update(
    id: string,
    updatePhytosanitaryTreatmentDto: UpdatePhytosanitaryTreatmentDto,
    organizationId: string,
  ) {
    const treatment = await this.findOne(id, organizationId);

    treatment.name =
      updatePhytosanitaryTreatmentDto.name ?? treatment.name;

    treatment.product =
      updatePhytosanitaryTreatmentDto.product ?? treatment.product;

    treatment.activeIngredient =
      updatePhytosanitaryTreatmentDto.activeIngredient ??
      treatment.activeIngredient;

    treatment.treatmentType =
      updatePhytosanitaryTreatmentDto.treatmentType ??
      treatment.treatmentType;

    treatment.scheduledDate =
      updatePhytosanitaryTreatmentDto.scheduledDate ??
      treatment.scheduledDate;

    treatment.completedDate =
      updatePhytosanitaryTreatmentDto.completedDate ??
      treatment.completedDate;

    treatment.dose =
      updatePhytosanitaryTreatmentDto.dose ?? treatment.dose;

    treatment.unit =
      updatePhytosanitaryTreatmentDto.unit ?? treatment.unit;

    treatment.target =
      updatePhytosanitaryTreatmentDto.target ?? treatment.target;

    treatment.applicationMethod =
      updatePhytosanitaryTreatmentDto.applicationMethod ??
      treatment.applicationMethod;

    treatment.notes =
      updatePhytosanitaryTreatmentDto.notes ?? treatment.notes;

    return this.phytosanitaryRepository.save(treatment);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const treatment = await this.findOne(id, organizationId);

    await this.phytosanitaryRepository.remove(treatment);
  }
}

