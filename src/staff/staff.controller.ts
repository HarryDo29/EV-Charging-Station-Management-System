import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Param,
  Request,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { IncidentReportService } from './incident_report.service';
import { CreateStaffDto } from './dto/staff/createStaff.dto';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/enums/role.enum';
import { Roles } from 'src/auth/decorator/role.decorator';
import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';
import type { Request as RequestExpress } from 'express';
import { StartChargingDto } from 'src/station/dto/charge_point/startCharging.dto';
import { EndChargingDto } from 'src/station/dto/charge_point/endCharging.dto';
import { CreateIncidentReportDto } from './dto/incident_report/createIncedentReport.dto';

@Controller('staff')
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly incidentReportService: IncidentReportService,
  ) {}

  // STAFF
  @Post('/create')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN)
  async createStaff(@Body() staff: CreateStaffDto) {
    return await this.staffService.createStaff(staff);
  }

  @Get('/get-charge-points/:station_id')
  @UseGuards(AuthGuard('jwt'))
  async getChargePoints(@Param('station_id') station_id: string) {
    return await this.staffService.getChargePointsInStation(station_id);
  }

  @Get('/get-incident-reports')
  @UseGuards(AuthGuard('jwt'))
  async getIncidentReports(@Request() req: RequestExpress) {
    const acc = req.user as AuthenticatedUserDto;
    return await this.incidentReportService.getIncidentReportsByStaff(acc.id);
  }

  @Post('/start-charge-point')
  @UseGuards(AuthGuard('jwt'))
  async startChargePoint(@Body() body: StartChargingDto) {
    const { charge_point_id, start_time } = body;
    return await this.staffService.startChargePoint(
      charge_point_id,
      start_time,
    );
  }

  @Post('/end-charge-point')
  @UseGuards(AuthGuard('jwt'))
  async endChargePoint(@Body() body: EndChargingDto) {
    const { charge_point_id, end_time } = body;
    return await this.staffService.endChargePoint(charge_point_id, end_time);
  }

  // INCIDENT REPORT
  @Post('/create-incident-report')
  @UseGuards(AuthGuard('jwt'))
  async createIncidentReport(@Body() body: CreateIncidentReportDto) {
    return await this.incidentReportService.createIncidentReport(body);
  }

  @Get('/get-incident-reports/:charge_point_id')
  @UseGuards(AuthGuard('jwt'))
  async getIncidentReportsByChargePoint(
    @Param('charge_point_id') charge_point_id: string,
  ) {
    return await this.incidentReportService.getIncidentReportsByChargePoint(
      charge_point_id,
    );
  }

  @Get('/get-incident-reports/:staff_id')
  @UseGuards(AuthGuard('jwt'))
  async getIncidentReportsByStaff(@Param('staff_id') staff_id: string) {
    return await this.incidentReportService.getIncidentReportsByStaff(staff_id);
  }

  @Get('/get-incident-reports/:station_id')
  @UseGuards(AuthGuard('jwt'))
  async getIncidentReportsByStation(@Param('station_id') station_id: string) {
    return await this.incidentReportService.getIncidentReportsByStation(
      station_id,
    );
  }
}
