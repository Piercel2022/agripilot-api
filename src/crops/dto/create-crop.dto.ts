import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { CropStatus } from '../entities/crop.entity.js';

export class CreateCropDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  variety?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  season?: string;

  @IsOptional()
  @IsDateString()
  sowingDate?: string;

  @IsOptional()
  @IsDateString()
  harvestDate?: string;

  @IsOptional()
  @IsEnum(CropStatus)
  status?: CropStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsUUID()
  fieldId!: string;
}
