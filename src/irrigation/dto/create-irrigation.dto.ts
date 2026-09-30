import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

import {
  IrrigationMethod,
  IrrigationStatus,
} from '../entities/irrigation.entity.js';

export class CreateIrrigationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @IsEnum(IrrigationMethod)
  method!: IrrigationMethod;

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

  @IsUUID()
  interventionId!: string;
}
