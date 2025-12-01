import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OAuth2Dto {
  @ApiProperty({
    description: 'Email address from OAuth2 provider',
    example: 'user@example.com',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User name from OAuth2 provider',
    example: 'Nguyen Van A',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'OAuth2 access token',
    example: 'ya29.a0AfH6SMBx...',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty({
    description: 'Avatar URL from OAuth2 provider',
    example: 'https://lh3.googleusercontent.com/a/default-user',
  })
  @IsString()
  @IsNotEmpty()
  avatar_url: string;

  @ApiProperty({
    description: 'Google account ID (optional)',
    example: '102345678901234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  google_id: string;
}
