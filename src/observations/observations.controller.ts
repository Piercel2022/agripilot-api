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
import { CreateObservationDto } from './dto/create-observation.dto.js';
import { UpdateObservationDto } from './dto/update-observation.dto.js';
import { ObservationsService } from './observations.service.js';

type AuthenticatedRequest = Request & {
  user: {
    organization: {
      id: string;
    };
  };
};

@Controller('observations')
@UseGuards(JwtAuthGuard)
export class ObservationsController {
  constructor(
    private readonly observationsService: ObservationsService,
  ) {}

  @Post()
  create(
    @Body() createObservationDto: CreateObservationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.observationsService.create(
      createObservationDto,
      request.user.organization.id,
    );
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.observationsService.findAll(
      request.user.organization.id,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.observationsService.findOne(
      id,
      request.user.organization.id,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateObservationDto: UpdateObservationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.observationsService.update(
      id,
      updateObservationDto,
      request.user.organization.id,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.observationsService.remove(
      id,
      request.user.organization.id,
    );
  }
}
