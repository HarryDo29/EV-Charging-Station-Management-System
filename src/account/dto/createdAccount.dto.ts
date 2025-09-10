import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class CreateAccountDto {
  @IsString()
  full_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string; // <-- Nhận password thô, service sẽ hash nó

  @IsEnum(Role)
  role: Role;
}
