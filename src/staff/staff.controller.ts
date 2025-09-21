import { Controller } from '@nestjs/common';
import { StaffService } from './staff.service';
import { IncidentReportService } from './incident_report.service';

@Controller('staff')
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly incidentReportService: IncidentReportService,
  ) {}
}
