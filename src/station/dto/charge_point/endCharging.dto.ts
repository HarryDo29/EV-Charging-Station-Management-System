import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EndChargingDto {
  @ApiProperty({
    description: 'ID of the charge point to end charging',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  charge_point_id: string;

  @ApiProperty({
    description: 'End time of charging',
    example: '16:30',
  })
  @IsString()
  @IsNotEmpty()
  end_time: string;
}
