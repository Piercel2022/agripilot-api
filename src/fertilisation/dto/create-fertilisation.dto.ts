import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import {
  FertilisationApplicationMethod,
  FertilisationStatus,
  FertilisationType,
  FertilisationUnit,
} from '../entities/fertilisation.entity.js';

export class CreateFertilisationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  product!: string;

  @IsEnum(FertilisationType)
  type!: FertilisationType;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @IsOptional()
  @IsNumberString()
  quantity?: string;

  @IsOptional()
  @IsEnum(FertilisationUnit)
  unit?: FertilisationUnit;

  @IsOptional()
  @IsEnum(FertilisationApplicationMethod)
  applicationMethod?: FertilisationApplicationMethod;

  @IsOptional()
  @IsEnum(FertilisationStatus)
  status?: FertilisationStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsUUID()
  interventionId!: string;
}
