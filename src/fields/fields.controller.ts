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
import { CreateFieldDto } from './dto/create-field.dto.js';
import { UpdateFieldDto } from './dto/update-field.dto.js';
import { FieldsService } from './fields.service.js';

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

@Controller('fields')
@UseGuards(JwtAuthGuard)
export class FieldsController {
  constructor(
    private readonly fieldsService: FieldsService,
  ) {}

  @Post()
  create(
    @Body() createFieldDto: CreateFieldDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.fieldsService.create(
      createFieldDto,
      request.user.organization.id,
    );
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.fieldsService.findAll(
      request.user.organization.id,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.fieldsService.findOne(
      id,
      request.user.organization.id,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFieldDto: UpdateFieldDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.fieldsService.update(
      id,
      updateFieldDto,
      request.user.organization.id,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.fieldsService.remove(
      id,
      request.user.organization.id,
    );
  }
}
