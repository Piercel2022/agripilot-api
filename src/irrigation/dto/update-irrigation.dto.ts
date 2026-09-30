import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import {
  IrrigationMethod,
  IrrigationStatus,
} from '../entities/irrigation.entity.js';

export class UpdateIrrigationDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsEnum(IrrigationMethod)
  method?: IrrigationMethod;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsNumberString()
  waterVolumeLiters?: string;

  @IsOptional()
  @IsEnum(IrrigationStatus)
  status?: IrrigationStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
