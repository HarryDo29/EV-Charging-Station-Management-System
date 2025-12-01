import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChargingSessionDto {
  @ApiProperty({
    description: 'ID of the reservation for this charging session',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  reservation_id: string;

  @ApiProperty({
    description: 'Date of the charging session in YYYY-MM-DD format',
    example: '2024-12-25',
  })
  @IsDateString()
  @IsNotEmpty()
  day: string; // format: YYYY-MM-DD

  @ApiProperty({
    description: 'Start time of the charging session',
    example: '14:00',
  })
  @IsString()
  @IsNotEmpty()
  start_time: string;

  //   @IsNumber()
  //   @IsNotEmpty()
  //   energy_consumed_kwh: number;

  //   @IsNumber()
  //   @IsNotEmpty()
  //   total_price: number;
}
