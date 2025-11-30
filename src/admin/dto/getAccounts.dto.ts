import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class GetAccountsDto {
  // filter by full_name
  @IsString()
  @IsOptional()
  full_name?: string;

  // filter by role
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  // filter by is_verified
  @IsBoolean()
  @IsOptional()
  is_verified?: boolean;

  // filter by is_active
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  // sort by created_at
  @IsString()
  @IsOptional()
  sort?: string;

  // pagination
  @IsNumber()
  @IsOptional()
  page?: number;

  // pagination
  @IsNumber()
  @IsOptional()
  limit?: number;
}
