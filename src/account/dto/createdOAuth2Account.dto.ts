import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsUrl } from 'class-validator';

export class CreateOAuth2AccountDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsUrl()
  @IsNotEmpty()
  avatar_url: string;

  @IsString()
  @IsNotEmpty()
  google_id: string;
}
