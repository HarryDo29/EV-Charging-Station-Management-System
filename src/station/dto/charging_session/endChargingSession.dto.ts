import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EndChargingSessionDto {
  @ApiProperty({
    description: 'ID of the charging session to end',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  charging_session_id: string;

  @ApiProperty({
    description: 'End time of the charging session',
    example: '16:30',
  })
  @IsString()
  @IsNotEmpty()
  end_time: string;
}
