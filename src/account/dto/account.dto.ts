import { Role, textToRole } from 'src/enums/role.enum';
import {
  IsEmail,
  IsString,
  IsEnum,
  IsBoolean,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AccountDto {
  @ApiProperty({
    description: 'Unique identifier for the account',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsUUID('all')
  id: string;

  @ApiProperty({
    description: 'Full name of the account holder',
    example: 'Nguyen Van A',
  })
  @IsString()
  full_name: string;

  @ApiProperty({
    description: 'Email address of the account holder',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Phone number of the account holder',
    example: '+84912345678',
    required: false,
  })
  @IsString()
  phone_number?: string;

  @ApiProperty({
    description: 'Role of the account in the system',
    example: 'USER',
    enum: Role,
  })
  @IsEnum(Role)
  @Transform(({ value }: { value: string }) => textToRole(value))
  role: Role;

  @ApiProperty({
    description: 'Whether the account email has been verified',
    example: true,
  })
  @IsBoolean()
  is_verified: boolean;

  @ApiProperty({
    description: 'Whether the account is currently active',
    example: true,
  })
  @IsBoolean()
  is_active: boolean;

  @ApiProperty({
    description: "URL to the user's avatar image",
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsUrl()
  avatar_url?: string;
}
