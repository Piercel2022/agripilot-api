import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Field } from '../fields/entities/field.entity.js';
import { ObservationsController } from './observations.controller.js';
import { ObservationsService } from './observations.service.js';
import { Observation } from './entities/observation.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Observation, Field]),
  ],
  controllers: [ObservationsController],
  providers: [ObservationsService],
  exports: [ObservationsService],
})
export class ObservationsModule {}
