import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Intervention } from '../interventions/entities/intervention.entity.js';
import { FieldOperation } from './entities/field-operation.entity.js';
import { FieldOperationsController } from './field-operations.controller.js';
import { FieldOperationsService } from './field-operations.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FieldOperation,
      Intervention,
    ]),
  ],
  controllers: [FieldOperationsController],
  providers: [FieldOperationsService],
  exports: [FieldOperationsService],
})
export class FieldOperationsModule {}
