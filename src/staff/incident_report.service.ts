import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, In, UpdateResult } from 'typeorm';
import { IncidentReportEntity } from './entity/incident_report.entity';
import { CreateIncidentReportDto } from './dto/incident_report/createIncedentReport.dto';
import { ChargePointEntity } from 'src/station/entity/charge_point.entity';
import { StaffEntity } from './entity/staff.entity';
import { StationEntity } from 'src/station/entity/station.entity';
import { ReportStatus } from 'src/enums/reportStatus.enum';

@Injectable()
export class IncidentReportService {
  constructor(
    private readonly incidentReportRepo: Repository<IncidentReportEntity>,
    private readonly chargePointRepo: Repository<ChargePointEntity>,
    private readonly staffRepo: Repository<StaffEntity>,
    private readonly stationRepo: Repository<StationEntity>,
  ) {}

  // create incident report
  async createIncidentReport(
    incidentReport: CreateIncidentReportDto,
  ): Promise<IncidentReportEntity> {
    const { charge_point_id, staff_id, description, report_at } =
      incidentReport;
    // find charge point
    const chargePoint = await this.chargePointRepo.findOne({
      where: { id: charge_point_id },
    });
    if (!chargePoint) {
      throw new NotFoundException('Charge point not found');
    }
    // find staff
    const staff = await this.staffRepo.findOne({
      where: { id: staff_id },
    });
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    // create incident report
    const newIncidentReport = this.incidentReportRepo.create({
      description: description,
      charge_point: chargePoint,
      charge_point_id: charge_point_id,
      staff: staff,
      staff_id: staff_id,
      report_at: report_at,
    });
    return await this.incidentReportRepo.save(newIncidentReport);
  }

  // update incident report status
  async updateIncidentReportStatus(
    id: string,
    status: ReportStatus,
  ): Promise<UpdateResult> {
    // find incident report
    const incidentReport = await this.incidentReportRepo.findOne({
      where: { id: id },
    });
    if (!incidentReport) {
      throw new NotFoundException('Incident report not found');
    }
    // update incident report status
    return await this.incidentReportRepo.update(id, { status: status });
  }

  // get incident reports by charge point
  async getIncidentReportsByChargePoint(
    charge_point_id: string,
  ): Promise<IncidentReportEntity[]> {
    // find charge point
    const chargePoint = await this.chargePointRepo.findOne({
      where: { id: charge_point_id },
    });
    if (!chargePoint) {
      throw new NotFoundException('Charge point not found');
    }
    // get all incident reports (DESC)
    return await this.incidentReportRepo.find({
      where: { charge_point_id: charge_point_id },
      order: {
        created_at: 'DESC',
      },
      relations: ['charge_point', 'staff'],
    });
  }

  // get incident reports by staff
  async getIncidentReportsByStaff(
    staff_id: string,
  ): Promise<IncidentReportEntity[]> {
    // find staff
    const staff = await this.staffRepo.findOne({
      where: { id: staff_id },
    });
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    return await this.incidentReportRepo.find({
      where: { staff_id: staff_id },
      order: {
        created_at: 'DESC',
      },
      relations: ['charge_point', 'staff'],
    });
  }

  // get incident reports by station
  async getIncidentReportsByStation(
    station_id: string,
  ): Promise<IncidentReportEntity[]> {
    // find station
    const station = await this.stationRepo.findOne({
      where: { id: station_id },
      relations: ['charge_points'],
    });
    if (!station) {
      throw new NotFoundException('Station not found');
    }
    // get all charge point ids from station
    const charge_point_ids: string[] = [];
    for (const charge_point of station.charge_points) {
      charge_point_ids.push(charge_point.id);
    }
    // get all incident reports (DESC)
    return await this.incidentReportRepo.find({
      where: {
        charge_point_id: In(charge_point_ids),
      },
      order: {
        created_at: 'DESC',
      },
      relations: ['charge_point', 'staff'],
    });
  }
}
