import { Role, textToRole } from 'src/enums/role.enum';
import {
  IsEmail,
  IsString,
  IsEnum,
  IsBoolean,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class AccountDto {
  @IsString()
  @IsUUID('all')
  id: string;

  @IsString()
  full_name: string;

  @IsEmail()
  email: string;

  

  @IsString()
  phone_number?: string;

  @IsEnum(Role)
  @Transform(({ value }: { value: string }) => textToRole(value))
  role: Role;

  @IsBoolean()
  is_verified: boolean;

  @IsBoolean()
  is_active: boolean;

  @IsUrl()
  avatar_url?: string;
}
