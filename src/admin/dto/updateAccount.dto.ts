import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiProperty({
    description: 'Updated full name',
    example: 'Nguyen Van A',
    required: false,
  })
  @IsString()
  @IsOptional()
  full_name?: string;

  @ApiProperty({
    description: 'Updated email address',
    example: 'newemail@example.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Updated phone number',
    example: '+84912345678',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiProperty({
    description: 'Account active status',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
