import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateIncidentReportDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDate()
  @IsNotEmpty()
  report_at: Date;

  @IsUUID()
  @IsNotEmpty()
  staff_id: string;

  @IsUUID()
  @IsNotEmpty()
  charge_point_id: string;
}
