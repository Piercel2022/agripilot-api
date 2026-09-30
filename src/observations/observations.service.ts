import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Field } from '../fields/entities/field.entity.js';
import { CreateObservationDto } from './dto/create-observation.dto.js';
import { UpdateObservationDto } from './dto/update-observation.dto.js';
import { Observation } from './entities/observation.entity.js';

@Injectable()
export class ObservationsService {
  constructor(
    @InjectRepository(Observation)
    private readonly observationRepository: Repository<Observation>,

    @InjectRepository(Field)
    private readonly fieldRepository: Repository<Field>,
  ) {}

  async create(
    createObservationDto: CreateObservationDto,
    organizationId: string,
  ) {
    const field = await this.fieldRepository.findOne({
      where: {
        id: createObservationDto.fieldId,
        farm: {
          organization: {
            id: organizationId,
          },
        },
      },
      relations: {
        farm: true,
      },
    });

    if (!field) {
      throw new NotFoundException('Field not found');
    }

    const observation = this.observationRepository.create({
      name: createObservationDto.name,
      type: createObservationDto.type,
      observedAt: createObservationDto.observedAt,
      severity: createObservationDto.severity,
      description: createObservationDto.description,
      notes: createObservationDto.notes,
      field,
    });

    return this.observationRepository.save(observation);
  }

  async findAll(organizationId: string) {
    return this.observationRepository.find({
      where: {
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
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const observation = await this.observationRepository.findOne({
      where: {
        id,
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

    if (!observation) {
      throw new NotFoundException('Observation not found');
    }

    return observation;
  }

  async update(
    id: string,
    updateObservationDto: UpdateObservationDto,
    organizationId: string,
  ) {
    const observation = await this.findOne(id, organizationId);

    observation.name =
      updateObservationDto.name ?? observation.name;

    observation.type =
      updateObservationDto.type ?? observation.type;

    observation.observedAt =
      updateObservationDto.observedAt ?? observation.observedAt;

    observation.severity =
      updateObservationDto.severity ?? observation.severity;

    observation.description =
      updateObservationDto.description ?? observation.description;

    observation.notes =
      updateObservationDto.notes ?? observation.notes;

    return this.observationRepository.save(observation);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const observation = await this.findOne(id, organizationId);

    await this.observationRepository.remove(observation);
  }
}
