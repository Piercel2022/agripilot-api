import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

import { FieldOperationStatus } from '../entities/field-operation.entity.js';

export class CreateFieldOperationDto {
  @IsUUID()
  interventionId!: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationMinutes?: number;

  @IsOptional()
  @IsEnum(FieldOperationStatus)
  status?: FieldOperationStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
