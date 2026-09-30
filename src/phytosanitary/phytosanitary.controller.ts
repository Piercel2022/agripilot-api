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
import { CreatePhytosanitaryTreatmentDto } from './dto/create-phytosanitary-treatment.dto.js';
import { UpdatePhytosanitaryTreatmentDto } from './dto/update-phytosanitary-treatment.dto.js';
import { PhytosanitaryService } from './phytosanitary.service.js';

type AuthenticatedRequest = Request & {
  user: {
    organization: {
      id: string;
    };
  };
};

@Controller('phytosanitary')
@UseGuards(JwtAuthGuard)
export class PhytosanitaryController {
  constructor(
    private readonly phytosanitaryService: PhytosanitaryService,
  ) {}

  @Post()
  create(
    @Body()
    createPhytosanitaryTreatmentDto: CreatePhytosanitaryTreatmentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.phytosanitaryService.create(
      createPhytosanitaryTreatmentDto,
      request.user.organization.id,
    );
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.phytosanitaryService.findAll(
      request.user.organization.id,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.phytosanitaryService.findOne(
      id,
      request.user.organization.id,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updatePhytosanitaryTreatmentDto: UpdatePhytosanitaryTreatmentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.phytosanitaryService.update(
      id,
      updatePhytosanitaryTreatmentDto,
      request.user.organization.id,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.phytosanitaryService.remove(
      id,
      request.user.organization.id,
    );
  }
}

