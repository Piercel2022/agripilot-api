import { PartialType } from '@nestjs/mapped-types';

import { CreateHarvestDto } from './create-harvest.dto.js';

export class UpdateHarvestDto extends PartialType(CreateHarvestDto) {}
