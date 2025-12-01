import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOAuth2AccountDto {
  @ApiProperty({
    description: 'Full name from OAuth2 provider',
    example: 'Nguyen Van A',
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    description: 'Email address from OAuth2 provider',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Avatar URL from OAuth2 provider',
    example: 'https://lh3.googleusercontent.com/a/default-user',
  })
  @IsUrl()
  @IsNotEmpty()
  avatar_url: string;

  @ApiProperty({
    description: 'Google account ID',
    example: '102345678901234567890',
  })
  @IsString()
  @IsNotEmpty()
  google_id: string;
}
