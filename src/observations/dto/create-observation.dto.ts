import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsUUID,
} from 'class-validator';

import {
  ObservationSeverity,
  ObservationType,
} from '../entities/observation.entity.js';

export class CreateObservationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @IsEnum(ObservationType)
  type!: ObservationType;

  @IsOptional()
  @IsDateString()
  observedAt?: string;

  @IsOptional()
  @IsEnum(ObservationSeverity)
  severity?: ObservationSeverity;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsUUID()
  fieldId!: string;
}
