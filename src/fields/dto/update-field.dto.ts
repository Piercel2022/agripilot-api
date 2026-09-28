import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateFieldDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  areaHectares?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  soilType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cropType?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
