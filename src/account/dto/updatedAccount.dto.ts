import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './createdAccount.dto';
import { IsString, IsEnum, IsBoolean } from 'class-validator';
import { Role } from 'src/enums/role.enum';

// PartialType will take all properties of CreateAccountDto
export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @IsString()
  full_name?: string;

  @IsString()
  email?: string;

  @IsString()
  password_hash?: string;

  @IsEnum(Role)
  role?: Role;

  @IsBoolean()
  is_verified?: boolean;

  @IsBoolean()
  is_active?: boolean;
}
