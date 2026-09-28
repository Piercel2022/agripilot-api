import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateFieldDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsNumber()
  @Min(0)
  areaHectares!: number;

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

  @IsUUID()
  farmId!: string;
}
