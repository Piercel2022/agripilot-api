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
import { CreateInterventionDto } from './dto/create-intervention.dto.js';
import { UpdateInterventionDto } from './dto/update-intervention.dto.js';
import { InterventionsService } from './interventions.service.js';

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

@Controller('interventions')
@UseGuards(JwtAuthGuard)
export class InterventionsController {
  constructor(
    private readonly interventionsService: InterventionsService,
  ) {}

  @Post()
  create(
    @Body() createInterventionDto: CreateInterventionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.interventionsService.create(
      createInterventionDto,
      request.user.organization.id,
    );
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.interventionsService.findAll(
      request.user.organization.id,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.interventionsService.findOne(
      id,
      request.user.organization.id,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInterventionDto: UpdateInterventionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.interventionsService.update(
      id,
      updateInterventionDto,
      request.user.organization.id,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.interventionsService.remove(
      id,
      request.user.organization.id,
    );
  }
}
