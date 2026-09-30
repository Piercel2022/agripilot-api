import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  FertilisationApplicationMethod,
  FertilisationStatus,
  FertilisationType,
  FertilisationUnit,
} from '../entities/fertilisation.entity.js';

export class UpdateFertilisationDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  product?: string;

  @IsOptional()
  @IsEnum(FertilisationType)
  type?: FertilisationType;

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
}
