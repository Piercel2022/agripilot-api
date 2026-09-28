import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organization } from './entities/organization.entity.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { UpdateOrganizationDto } from './dto/update-organization.dto.js';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationsRepository: Repository<Organization>,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    const existingOrganization = await this.organizationsRepository.findOne({
      where: { slug: createOrganizationDto.slug },
    });

    if (existingOrganization) {
      throw new ConflictException(
        'An organization with this slug already exists',
      );
    }

    const organization = this.organizationsRepository.create(
      createOrganizationDto,
    );

    return this.organizationsRepository.save(organization);
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationsRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationsRepository.findOne({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    const organization = await this.findOne(id);

    if (
      updateOrganizationDto.slug &&
      updateOrganizationDto.slug !== organization.slug
    ) {
      const existingOrganization = await this.organizationsRepository.findOne({
        where: { slug: updateOrganizationDto.slug },
      });

      if (existingOrganization) {
        throw new ConflictException(
          'An organization with this slug already exists',
        );
      }
    }

    Object.assign(organization, updateOrganizationDto);

    return this.organizationsRepository.save(organization);
  }

  async remove(id: string): Promise<void> {
    const organization = await this.findOne(id);

    await this.organizationsRepository.remove(organization);
  }
}
