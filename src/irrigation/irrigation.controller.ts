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
import { CreateIrrigationDto } from './dto/create-irrigation.dto.js';
import { UpdateIrrigationDto } from './dto/update-irrigation.dto.js';
import { IrrigationService } from './irrigation.service.js';

type AuthenticatedRequest = Request & {
  user: {
    organization: {
      id: string;
    };
  };
};

@Controller('irrigations')
@UseGuards(JwtAuthGuard)
export class IrrigationController {
  constructor(
    private readonly irrigationService: IrrigationService,
  ) {}

  @Post()
  create(
    @Body() createIrrigationDto: CreateIrrigationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.irrigationService.create(
      createIrrigationDto,
      request.user.organization.id,
    );
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.irrigationService.findAll(
      request.user.organization.id,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.irrigationService.findOne(
      id,
      request.user.organization.id,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIrrigationDto: UpdateIrrigationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.irrigationService.update(
      id,
      updateIrrigationDto,
      request.user.organization.id,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.irrigationService.remove(
      id,
      request.user.organization.id,
    );
  }
}
