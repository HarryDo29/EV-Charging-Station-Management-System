import { IsEmail, IsString, IsUUID, IsBoolean, IsUrl } from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { Role, roleToText } from 'src/enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'Nguyen Van A',
  })
  @Expose()
  @IsString()
  full_name: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+84912345678',
    required: false,
  })
  @Expose()
  @IsString()
  phone_number?: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  @Expose()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Role of the user in the system',
    example: 'USER',
  })
  @Expose()
  @IsString()
  @Transform(({ value }: { value: Role }) => roleToText(value))
  role: string;

  @ApiProperty({
    description: "Whether the user's email has been verified",
    example: true,
  })
  @Expose()
  @IsBoolean()
  is_verified: boolean;

  @ApiProperty({
    description: 'Whether the user account is currently active',
    example: true,
  })
  @Expose()
  @IsBoolean()
  is_active: boolean;

  @ApiProperty({
    description: 'Whether the account was created via OAuth2',
    example: false,
  })
  @Expose()
  @IsBoolean()
  is_oauth2: boolean;

  @ApiProperty({
    description: "URL to the user's avatar image",
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @Expose()
  @IsUrl()
  avatar_url?: string;

  @ApiProperty({
    description: 'Google ID for OAuth2 authentication',
    example: '102345678901234567890',
    required: false,
  })
  @Expose()
  @IsString()
  google_id?: string;
}
