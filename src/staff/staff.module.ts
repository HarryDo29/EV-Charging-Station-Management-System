import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { IncidentReportService } from './incident_report.service';

@Module({
  imports: [],
  controllers: [StaffController],
  providers: [StaffService, IncidentReportService],
  exports: [StaffService, IncidentReportService],
})
export class StaffModule {}
