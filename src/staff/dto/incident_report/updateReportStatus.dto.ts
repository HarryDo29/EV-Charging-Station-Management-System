import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ReportStatus } from 'src/enums/reportStatus.enum';

export class UpdateReportStatusDto {
  @IsString()
  @IsNotEmpty()
  report_id: string;

  @IsEnum(ReportStatus)
  @IsNotEmpty()
  status: ReportStatus;
}
