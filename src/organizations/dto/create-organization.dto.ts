import { IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @Length(2, 150)
  name!: string;

  @IsString()
  @Length(2, 100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug!: string;

  @IsOptional()
  @IsEmail()
  @Length(3, 255)
  email?: string;

  @IsOptional()
  @IsString()
  @Length(3, 30)
  phone?: string;
}
