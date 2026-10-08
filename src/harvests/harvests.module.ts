import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Campaign } from '../campaigns/entities/campaign.entity.js';
import { Crop } from '../crops/entities/crop.entity.js';
import { Harvest } from './entities/harvest.entity.js';
import { HarvestsController } from './harvests.controller.js';
import { HarvestsService } from './harvests.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Harvest, Crop, Campaign])],
  controllers: [HarvestsController],
  providers: [HarvestsService],
  exports: [HarvestsService],
})
export class HarvestsModule {}
