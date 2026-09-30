import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Intervention } from '../interventions/entities/intervention.entity.js';
import { IrrigationController } from './irrigation.controller.js';
import { IrrigationService } from './irrigation.service.js';
import { Irrigation } from './entities/irrigation.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Irrigation, Intervention]),
  ],
  controllers: [IrrigationController],
  providers: [IrrigationService],
  exports: [IrrigationService],
})
export class IrrigationModule {}
