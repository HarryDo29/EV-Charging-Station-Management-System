import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIncidentReportDto {
  @ApiProperty({
    description: 'Detailed description of the incident',
    example: 'Charge point not responding to commands',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Date and time when the incident was reported',
    example: '2024-12-25T14:30:00Z',
  })
  @IsDate()
  @IsNotEmpty()
  report_at: Date;

  @ApiProperty({
    description: 'ID of the staff member reporting the incident',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  staff_id: string;

  @ApiProperty({
    description: 'ID of the charge point where the incident occurred',
    example: '650e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  charge_point_id: string;
}
