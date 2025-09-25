import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

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
}
