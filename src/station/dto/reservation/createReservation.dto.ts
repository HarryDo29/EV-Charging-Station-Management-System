import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({
    description: 'Date of the reservation in YYYY-MM-DD format',
    example: '2024-12-25',
  })
  @IsDateString()
  @IsNotEmpty()
  reservation_day: string; // format: YYYY-MM-DD

  @ApiProperty({
    description: 'Start time of the reservation',
    example: '14:00',
  })
  @IsString()
  @IsNotEmpty()
  start_time: string;

  @ApiProperty({
    description: 'End time of the reservation',
    example: '16:00',
  })
  @IsString()
  @IsNotEmpty()
  end_time: string;

  @ApiProperty({
    description: 'ID of the charge point to reserve',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  charge_point_id: string;

  @ApiProperty({
    description: 'ID of the vehicle for this reservation',
    example: '650e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  vehicle_id: string;
}
