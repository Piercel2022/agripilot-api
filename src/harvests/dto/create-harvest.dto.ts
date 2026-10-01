import { IsDateString, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateHarvestDto {
  @IsString()
  cropId!: string;

  @IsString()
  campaignId!: string;

  @IsDateString()
  harvestDate!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsString()
  @MaxLength(20)
  unit!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  yield?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  quality?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
