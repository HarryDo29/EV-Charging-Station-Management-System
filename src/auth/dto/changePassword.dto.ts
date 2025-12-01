import { IsString, IsNotEmpty, IsStrongPassword } from 'class-validator';
import { Match } from '../decorator/match.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password for verification',
    example: 'MyOldP@ssw0rd123',
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    description: 'New strong password (min 8 chars, must include uppercase, lowercase, number, and symbol)',
    example: 'MyNewP@ssw0rd456',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @ApiProperty({
    description: 'Password confirmation (must match new password)',
    example: 'MyNewP@ssw0rd456',
  })
  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  @IsNotEmpty()
  confirmedPassword: string;
}
