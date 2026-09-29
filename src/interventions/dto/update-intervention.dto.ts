import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  InterventionStatus,
  InterventionType,
} from '../entities/intervention.entity.js';

export class UpdateInterventionDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsEnum(InterventionType)
  type?: InterventionType;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @IsOptional()
  @IsEnum(InterventionStatus)
  status?: InterventionStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
