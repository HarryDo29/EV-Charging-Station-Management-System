import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IncidentReportEntity } from './entity/incident_report.entity';

@Injectable()
export class IncidentReportService {
  constructor(
    private readonly incidentReportRepo: Repository<IncidentReportEntity>,
  ) {}
}
