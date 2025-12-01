import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartChargingDto {
  @ApiProperty({
    description: 'ID of the charge point to start charging',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  charge_point_id: string;

  @ApiProperty({
    description: 'Date of charging in YYYY-MM-DD format',
    example: '2024-12-25',
  })
  @IsString()
  @IsNotEmpty()
  day: string;

  @ApiProperty({
    description: 'Start time of charging',
    example: '14:00',
  })
  @IsString()
  @IsNotEmpty()
  start_time: string;
}
