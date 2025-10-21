import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OAuth2Dto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  avatar_url: string;

  @IsString()
  @IsOptional()
  google_id: string;
}
