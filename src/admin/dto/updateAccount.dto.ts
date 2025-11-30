import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  full_name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone_number?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
