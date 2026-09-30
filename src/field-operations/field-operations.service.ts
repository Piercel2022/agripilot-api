import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Intervention } from '../interventions/entities/intervention.entity.js';
import { CreateFieldOperationDto } from './dto/create-field-operation.dto.js';
import { UpdateFieldOperationDto } from './dto/update-field-operation.dto.js';
import { FieldOperation } from './entities/field-operation.entity.js';

@Injectable()
export class FieldOperationsService {
  constructor(
    @InjectRepository(FieldOperation)
    private readonly fieldOperationsRepository: Repository<FieldOperation>,

    @InjectRepository(Intervention)
    private readonly interventionsRepository: Repository<Intervention>,
  ) {}

  async create(
    createFieldOperationDto: CreateFieldOperationDto,
    organizationId: string,
  ) {
    const intervention = await this.interventionsRepository.findOne({
      where: {
        id: createFieldOperationDto.interventionId,
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

    const fieldOperation = this.fieldOperationsRepository.create({
      startedAt: createFieldOperationDto.startedAt
        ? new Date(createFieldOperationDto.startedAt)
        : undefined,
      completedAt: createFieldOperationDto.completedAt
        ? new Date(createFieldOperationDto.completedAt)
        : undefined,
      durationMinutes: createFieldOperationDto.durationMinutes,
      status: createFieldOperationDto.status,
      notes: createFieldOperationDto.notes,
      intervention,
    });

    return this.fieldOperationsRepository.save(fieldOperation);
  }

  async findAll(organizationId: string) {
    return this.fieldOperationsRepository.find({
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
    const fieldOperation = await this.fieldOperationsRepository.findOne({
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

    if (!fieldOperation) {
      throw new NotFoundException('Field operation not found');
    }

    return fieldOperation;
  }

  async update(
    id: string,
    updateFieldOperationDto: UpdateFieldOperationDto,
    organizationId: string,
  ) {
    const fieldOperation = await this.findOne(id, organizationId);

    fieldOperation.startedAt = updateFieldOperationDto.startedAt
      ? new Date(updateFieldOperationDto.startedAt)
      : fieldOperation.startedAt;

    fieldOperation.completedAt = updateFieldOperationDto.completedAt
      ? new Date(updateFieldOperationDto.completedAt)
      : fieldOperation.completedAt;

    fieldOperation.durationMinutes =
      updateFieldOperationDto.durationMinutes ??
      fieldOperation.durationMinutes;

    fieldOperation.status =
      updateFieldOperationDto.status ?? fieldOperation.status;

    fieldOperation.notes =
      updateFieldOperationDto.notes ?? fieldOperation.notes;

    return this.fieldOperationsRepository.save(fieldOperation);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const fieldOperation = await this.findOne(id, organizationId);

    await this.fieldOperationsRepository.remove(fieldOperation);
  }
}
