import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Farm } from '../farms/entities/farm.entity.js';
import { CreateFieldDto } from './dto/create-field.dto.js';
import { UpdateFieldDto } from './dto/update-field.dto.js';
import { Field } from './entities/field.entity.js';

@Injectable()
export class FieldsService {
  constructor(
    @InjectRepository(Field)
    private readonly fieldsRepository: Repository<Field>,

    @InjectRepository(Farm)
    private readonly farmsRepository: Repository<Farm>,
  ) {}

  async create(
    createFieldDto: CreateFieldDto,
    organizationId: string,
  ) {
    const farm = await this.farmsRepository.findOne({
      where: {
        id: createFieldDto.farmId,
        organization: {
          id: organizationId,
        },
      },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    const field = this.fieldsRepository.create({
      name: createFieldDto.name,
      areaHectares: createFieldDto.areaHectares,
      soilType: createFieldDto.soilType,
      cropType: createFieldDto.cropType,
      notes: createFieldDto.notes,
      farm,
    });

    return this.fieldsRepository.save(field);
  }

  async findAll(organizationId: string) {
    return this.fieldsRepository.find({
      where: {
        farm: {
          organization: {
            id: organizationId,
          },
        },
      },
      relations: {
        farm: true,
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
    const field = await this.fieldsRepository.findOne({
      where: {
        id,
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

    return field;
  }

  async update(
    id: string,
    updateFieldDto: UpdateFieldDto,
    organizationId: string,
  ) {
    const field = await this.findOne(
      id,
      organizationId,
    );

    field.name = updateFieldDto.name ?? field.name;
    field.areaHectares =
      updateFieldDto.areaHectares ?? field.areaHectares;
    field.soilType =
      updateFieldDto.soilType ?? field.soilType;
    field.cropType =
      updateFieldDto.cropType ?? field.cropType;
    field.notes =
      updateFieldDto.notes ?? field.notes;

    return this.fieldsRepository.save(field);
  }

  async remove(
    id: string,
    organizationId: string,
  ): Promise<void> {
    const field = await this.findOne(
      id,
      organizationId,
    );

    await this.fieldsRepository.remove(field);
  }
}