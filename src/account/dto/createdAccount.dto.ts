import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  full_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
