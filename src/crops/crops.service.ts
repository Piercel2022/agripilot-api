import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Field } from '../fields/entities/field.entity.js';
import { CreateCropDto } from './dto/create-crop.dto.js';
import { UpdateCropDto } from './dto/update-crop.dto.js';
import { Crop } from './entities/crop.entity.js';

@Injectable()
export class CropsService {
  constructor(
    @InjectRepository(Crop)
    private readonly cropsRepository: Repository<Crop>,

    @InjectRepository(Field)
    private readonly fieldsRepository: Repository<Field>,
  ) {}

  async create(
    createCropDto: CreateCropDto,
    organizationId: string,
  ) {
    const field = await this.fieldsRepository.findOne({
      where: {
        id: createCropDto.fieldId,
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

    const crop = this.cropsRepository.create({
      name: createCropDto.name,
      variety: createCropDto.variety,
      season: createCropDto.season,
      sowingDate: createCropDto.sowingDate,
      harvestDate: createCropDto.harvestDate,
      status: createCropDto.status,
      notes: createCropDto.notes,
      field,
    });

    return this.cropsRepository.save(crop);
  }

  async findAll(organizationId: string) {
    return this.cropsRepository.find({
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

  async findOne(
    id: string,
    organizationId: string,
  ) {
    const crop = await this.cropsRepository.findOne({
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

    if (!crop) {
      throw new NotFoundException('Crop not found');
    }

    return crop;
  }

  async update(
    id: string,
    updateCropDto: UpdateCropDto,
    organizationId: string,
  ) {
    const crop = await this.findOne(
      id,
      organizationId,
    );

    crop.name =
      updateCropDto.name ?? crop.name;

    crop.variety =
      updateCropDto.variety ?? crop.variety;

    crop.season =
      updateCropDto.season ?? crop.season;

    crop.sowingDate =
      updateCropDto.sowingDate ?? crop.sowingDate;

    crop.harvestDate =
      updateCropDto.harvestDate ?? crop.harvestDate;

    crop.status =
      updateCropDto.status ?? crop.status;

    crop.notes =
      updateCropDto.notes ?? crop.notes;

    return this.cropsRepository.save(crop);
  }

  async remove(
    id: string,
    organizationId: string,
  ): Promise<void> {
    const crop = await this.findOne(
      id,
      organizationId,
    );

    await this.cropsRepository.remove(crop);
  }
}
