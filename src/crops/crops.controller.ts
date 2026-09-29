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
import { CreateCropDto } from './dto/create-crop.dto.js';
import { UpdateCropDto } from './dto/update-crop.dto.js';
import { CropsService } from './crops.service.js';

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

@Controller('crops')
@UseGuards(JwtAuthGuard)
export class CropsController {
  constructor(
    private readonly cropsService: CropsService,
  ) {}

  @Post()
  create(
    @Body() createCropDto: CreateCropDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.cropsService.create(
      createCropDto,
      request.user.organization.id,
    );
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.cropsService.findAll(
      request.user.organization.id,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.cropsService.findOne(
      id,
      request.user.organization.id,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCropDto: UpdateCropDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.cropsService.update(
      id,
      updateCropDto,
      request.user.organization.id,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.cropsService.remove(
      id,
      request.user.organization.id,
    );
  }
}
