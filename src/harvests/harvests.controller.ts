import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateHarvestDto } from './dto/create-harvest.dto.js';
import { UpdateHarvestDto } from './dto/update-harvest.dto.js';
import { HarvestsService } from './harvests.service.js';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    organization: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

@Controller('harvests')
@UseGuards(JwtAuthGuard)
export class HarvestsController {
  constructor(
    private readonly harvestsService: HarvestsService,
  ) {}

  @Post()
  create(
    @Body() createHarvestDto: CreateHarvestDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.harvestsService.create(
      createHarvestDto,
      request.user.organization.id,
    );
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.harvestsService.findAll(
      request.user.organization.id,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.harvestsService.findOne(
      id,
      request.user.organization.id,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHarvestDto: UpdateHarvestDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.harvestsService.update(
      id,
      updateHarvestDto,
      request.user.organization.id,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.harvestsService.remove(
      id,
      request.user.organization.id,
    );
  }
}
