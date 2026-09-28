import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organization } from '../organizations/entities/organization.entity.js';
import { CreateFarmDto } from './dto/create-farm.dto.js';
import { UpdateFarmDto } from './dto/update-farm.dto.js';
import { Farm } from './entities/farm.entity.js';

@Injectable()
export class FarmsService {
  constructor(
    @InjectRepository(Farm)
    private readonly farmsRepository: Repository<Farm>,

    @InjectRepository(Organization)
    private readonly organizationsRepository: Repository<Organization>,
  ) {}

  async create(
    createFarmDto: CreateFarmDto,
    organizationId: string,
  ) {
    const organization = await this.organizationsRepository.findOne({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const farm = this.farmsRepository.create({
      name: createFarmDto.name,
      address: createFarmDto.address,
      city: createFarmDto.city,
      postalCode: createFarmDto.postalCode,
      country: createFarmDto.country,
      organization,
    });

    return this.farmsRepository.save(farm);
  }

  async findAll(organizationId: string) {
    return this.farmsRepository.find({
      where: {
        organization: {
          id: organizationId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const farm = await this.farmsRepository.findOne({
      where: {
        id,
        organization: {
          id: organizationId,
        },
      },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    return farm;
  }

  async update(
    id: string,
    updateFarmDto: UpdateFarmDto,
    organizationId: string,
  ) {
    const farm = await this.findOne(id, organizationId);

    farm.name = updateFarmDto.name ?? farm.name;
    farm.address = updateFarmDto.address ?? farm.address;
    farm.city = updateFarmDto.city ?? farm.city;
    farm.postalCode = updateFarmDto.postalCode ?? farm.postalCode;
    farm.country = updateFarmDto.country ?? farm.country;

    return this.farmsRepository.save(farm);
  }

  async remove(
    id: string,
    organizationId: string,
  ): Promise<void> {
    const farm = await this.findOne(id, organizationId);

    await this.farmsRepository.remove(farm);
  }
}