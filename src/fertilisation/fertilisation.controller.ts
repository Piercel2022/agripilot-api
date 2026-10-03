import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateFertilisationDto } from './dto/create-fertilisation.dto.js';
import { UpdateFertilisationDto } from './dto/update-fertilisation.dto.js';
import { FertilisationService } from './fertilisation.service.js';

type AuthenticatedRequest = Request & {
  user: {
    organization: {
      id: string;
    };
  };
};

@Controller('fertilisations')
@UseGuards(JwtAuthGuard)
export class FertilisationController {
  constructor(
    private readonly fertilisationService: FertilisationService,
  ) {}

  @Post()
  create(
    @Body() createFertilisationDto: CreateFertilisationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.fertilisationService.create(
      createFertilisationDto,
      request.user.organization.id,
    );
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.fertilisationService.findAll(
      request.user.organization.id,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.fertilisationService.findOne(
      id,
      request.user.organization.id,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFertilisationDto: UpdateFertilisationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.fertilisationService.update(
      id,
      updateFertilisationDto,
      request.user.organization.id,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.fertilisationService.remove(
      id,
      request.user.organization.id,
    );
  }
}
