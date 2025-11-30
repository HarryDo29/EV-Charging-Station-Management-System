import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Param,
  Request,
  Query,
  Put,
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
import { UpdateReportStatusDto } from './dto/incident_report/updateReportStatus.dto';

@Controller('staff')
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly incidentReportService: IncidentReportService,
  ) {}

  //______________________________________STAFF______________________________________
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
    const { charge_point_id, start_time, day } = body;
    return await this.staffService.startChargePoint(
      charge_point_id,
      day,
      start_time,
    );
  }

  @Post('/end-charge-point')
  @UseGuards(AuthGuard('jwt'))
  async endChargePoint(@Body() body: EndChargingDto) {
    const { charge_point_id, end_time } = body;
    return await this.staffService.endChargePoint(charge_point_id, end_time);
  }

  //______________________________________INCIDENT REPORT______________________________________
  @Post('/create-incident-report')
  @UseGuards(AuthGuard('jwt'))
  async createIncidentReport(@Body() body: CreateIncidentReportDto) {
    return await this.incidentReportService.createIncidentReport(body);
  }

  @Put('/update-incident-report-status')
  @UseGuards(AuthGuard('jwt'))
  async updateIncidentReportStatus(@Body() body: UpdateReportStatusDto) {
    return await this.incidentReportService.updateIncidentReportStatus(
      body.report_id,
      body.status,
    );
  }

  @Get('/get-incident-reports')
  @UseGuards(AuthGuard('jwt'))
  async getIncidentReportsByChargePoint(
    @Query('charge_point_id') charge_point_id?: string,
    @Query('staff_id') staff_id?: string,
    @Query('station_id') station_id?: string,
  ) {
    if (charge_point_id) {
      return await this.incidentReportService.getIncidentReportsByChargePoint(
        charge_point_id,
      );
    } else if (staff_id) {
      return await this.incidentReportService.getIncidentReportsByStaff(
        staff_id,
      );
    } else if (station_id) {
      return await this.incidentReportService.getIncidentReportsByStation(
        station_id,
      );
    }
  }
}
