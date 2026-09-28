import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Organization } from '../organizations/entities/organization.entity.js';
import { Farm } from './entities/farm.entity.js';
import { FarmsController } from './farms.controller.js';
import { FarmsService } from './farms.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Farm,
      Organization,
    ]),
  ],
  controllers: [FarmsController],
  providers: [FarmsService],
  exports: [FarmsService],
})
export class FarmsModule {}