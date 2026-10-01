import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Harvest } from './entities/harvest.entity.js';
import { HarvestsController } from './harvests.controller.js';
import { HarvestsService } from './harvests.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Harvest])],
  controllers: [HarvestsController],
  providers: [HarvestsService],
  exports: [HarvestsService],
})
export class HarvestsModule {}
