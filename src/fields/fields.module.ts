import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Farm } from '../farms/entities/farm.entity.js';
import { Field } from './entities/field.entity.js';
import { FieldsController } from './fields.controller.js';
import { FieldsService } from './fields.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Field,
      Farm,
    ]),
  ],
  controllers: [FieldsController],
  providers: [FieldsService],
  exports: [FieldsService],
})
export class FieldsModule {}