import { IsString, IsNotEmpty, IsStrongPassword } from 'class-validator';
import { Match } from '../decorator/match.decorator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

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

  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  @IsNotEmpty()
  confirmedPassword: string;
}
