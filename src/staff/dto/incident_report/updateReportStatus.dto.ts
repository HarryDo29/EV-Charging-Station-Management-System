import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ReportStatus } from 'src/enums/reportStatus.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReportStatusDto {
  @ApiProperty({
    description: 'ID of the incident report to update',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  report_id: string;

  @ApiProperty({
    description: 'New status for the incident report',
    example: 'RESOLVED',
    enum: ReportStatus,
  })
  @IsEnum(ReportStatus)
  @IsNotEmpty()
  status: ReportStatus;
}
