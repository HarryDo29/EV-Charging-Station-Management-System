import { Role } from 'src/enums/role.enum';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AuthenticatedUserDto {
  @ApiProperty({
    description: 'Unique identifier of the authenticated user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Name of the authenticated user',
    example: 'Nguyen Van A',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Role of the authenticated user',
    example: 'USER',
    enum: Role,
  })
  @Expose()
  role: Role;

  @ApiProperty({
    description: 'Token expiration timestamp (Unix timestamp)',
    example: 1735689600,
    required: false,
  })
  @Expose()
  exp?: number;
}
