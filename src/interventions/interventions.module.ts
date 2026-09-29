import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Campaign } from '../campaigns/entities/campaign.entity.js';
import { InterventionsController } from './interventions.controller.js';
import { InterventionsService } from './interventions.service.js';
import { Intervention } from './entities/intervention.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Intervention, Campaign])],
  controllers: [InterventionsController],
  providers: [InterventionsService],
  exports: [InterventionsService],
})
export class InterventionsModule {}
