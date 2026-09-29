import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Crop } from '../crops/entities/crop.entity.js';
import { CampaignsController } from './campaigns.controller.js';
import { CampaignsService } from './campaigns.service.js';
import { Campaign } from './entities/campaign.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Campaign,
      Crop,
    ]),
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
