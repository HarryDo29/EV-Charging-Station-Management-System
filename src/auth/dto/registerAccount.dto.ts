import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';
import { Match } from '../decorator/match.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Full name of the user registering',
    example: 'Nguyen Van A',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Full name must be at least 3 characters long' })
  full_name: string;

  @ApiProperty({
    description: 'Email of the user registering',
    example: 'user@example.com',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password of the user registering',
    example: 'MyP@ssw0rd123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @ApiProperty({
    description: 'Confirmed password of the user registering',
    example: 'MyP@ssw0rd123',
  })
  @IsString()
  @IsNotEmpty()
  @Match('password', { message: 'Passwords do not match' })
  @IsNotEmpty()
  confirmedPassword: string;
}
