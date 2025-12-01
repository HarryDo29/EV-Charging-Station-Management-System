import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Role } from 'src/enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStaffDto {
  @ApiProperty({
    description: 'Full name of the staff member',
    example: 'Tran Van B',
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    description: 'Email address for the staff account',
    example: 'staff@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Phone number of the staff member',
    example: '+84912345678',
  })
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({
    description: 'Password for the staff account',
    example: 'MyP@ssw0rd123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Role assignment (must be STAFF)',
    example: 'STAFF',
    enum: Role,
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role.STAFF;

  @ApiProperty({
    description: 'ID of the station this staff member is assigned to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  station_id: string;
}
