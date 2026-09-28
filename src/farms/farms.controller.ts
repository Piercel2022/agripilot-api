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
import { CreateFarmDto } from './dto/create-farm.dto.js';
import { UpdateFarmDto } from './dto/update-farm.dto.js';
import { FarmsService } from './farms.service.js';

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

@Controller('farms')
@UseGuards(JwtAuthGuard)
export class FarmsController {
  constructor(
    private readonly farmsService: FarmsService,
  ) {}

  @Post()
  create(
    @Body() createFarmDto: CreateFarmDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.farmsService.create(
      createFarmDto,
      request.user.organization.id,
    );
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.farmsService.findAll(
      request.user.organization.id,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.farmsService.findOne(
      id,
      request.user.organization.id,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFarmDto: UpdateFarmDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.farmsService.update(
      id,
      updateFarmDto,
      request.user.organization.id,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.farmsService.remove(
      id,
      request.user.organization.id,
    );
  }
}
