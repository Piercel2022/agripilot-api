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
import { CreateFieldOperationDto } from './dto/create-field-operation.dto.js';
import { UpdateFieldOperationDto } from './dto/update-field-operation.dto.js';
import { FieldOperationsService } from './field-operations.service.js';

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

@Controller('field-operations')
@UseGuards(JwtAuthGuard)
export class FieldOperationsController {
  constructor(
    private readonly fieldOperationsService: FieldOperationsService,
  ) {}

  @Post()
  create(
    @Body() createFieldOperationDto: CreateFieldOperationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.fieldOperationsService.create(
      createFieldOperationDto,
      request.user.organization.id,
    );
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.fieldOperationsService.findAll(
      request.user.organization.id,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.fieldOperationsService.findOne(
      id,
      request.user.organization.id,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFieldOperationDto: UpdateFieldOperationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.fieldOperationsService.update(
      id,
      updateFieldOperationDto,
      request.user.organization.id,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.fieldOperationsService.remove(
      id,
      request.user.organization.id,
    );
  }
}
