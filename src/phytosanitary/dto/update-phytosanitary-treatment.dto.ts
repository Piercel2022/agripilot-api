import { PartialType } from '@nestjs/mapped-types';

import { CreatePhytosanitaryTreatmentDto } from './create-phytosanitary-treatment.dto.js';

export class UpdatePhytosanitaryTreatmentDto extends PartialType(
  CreatePhytosanitaryTreatmentDto,
) {}

