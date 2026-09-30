import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Intervention } from '../interventions/entities/intervention.entity.js';
import { PhytosanitaryController } from './phytosanitary.controller.js';
import { PhytosanitaryService } from './phytosanitary.service.js';
import { PhytosanitaryTreatment } from './entities/phytosanitary-treatment.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PhytosanitaryTreatment,
      Intervention,
    ]),
  ],
  controllers: [PhytosanitaryController],
  providers: [PhytosanitaryService],
  exports: [PhytosanitaryService],
})
export class PhytosanitaryModule {}

