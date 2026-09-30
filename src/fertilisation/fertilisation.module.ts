import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Intervention } from '../interventions/entities/intervention.entity.js';
import { FertilisationController } from './fertilisation.controller.js';
import { FertilisationService } from './fertilisation.service.js';
import { Fertilisation } from './entities/fertilisation.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fertilisation, Intervention]),
  ],
  controllers: [FertilisationController],
  providers: [FertilisationService],
  exports: [FertilisationService],
})
export class FertilisationModule {}
