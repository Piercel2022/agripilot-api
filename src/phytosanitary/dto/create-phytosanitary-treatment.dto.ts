import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  ApplicationMethod,
  TreatmentType,
  TreatmentUnit,
} from '../entities/phytosanitary-treatment.entity.js';

export class CreatePhytosanitaryTreatmentDto {
  @IsString()
  @IsNotEmpty()
  interventionId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  product!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  activeIngredient?: string;

  @IsEnum(TreatmentType)
  treatmentType!: TreatmentType;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @IsOptional()
  @IsNumberString()
  dose?: string;

  @IsOptional()
  @IsEnum(TreatmentUnit)
  unit?: TreatmentUnit;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  target?: string;

  @IsOptional()
  @IsEnum(ApplicationMethod)
  applicationMethod?: ApplicationMethod;

  @IsOptional()
  @IsString()
  notes?: string;
}
