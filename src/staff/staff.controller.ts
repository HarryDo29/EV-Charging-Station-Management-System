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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
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

@ApiTags('Staff')
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new staff member (Admin only)' })
  @ApiResponse({ status: 201, description: 'Staff created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid staff data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async createStaff(@Body() staff: CreateStaffDto) {
    return await this.staffService.createStaff(staff);
  }

  @Get('/get-charge-points/:station_id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all charge points at a station' })
  @ApiParam({ name: 'station_id', description: 'Station ID' })
  @ApiResponse({ status: 200, description: 'List of charge points retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  async getChargePoints(@Param('station_id') station_id: string) {
    return await this.staffService.getChargePointsInStation(station_id);
  }

  @Get('/get-incident-reports')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get incident reports for current staff member' })
  @ApiResponse({ status: 200, description: 'List of incident reports retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getIncidentReports(@Request() req: RequestExpress) {
    const acc = req.user as AuthenticatedUserDto;
    return await this.incidentReportService.getIncidentReportsByStaff(acc.id);
  }

  @Post('/start-charge-point')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a charge point (Staff)' })
  @ApiResponse({ status: 200, description: 'Charge point started successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Charge point not found' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'End a charge point session (Staff)' })
  @ApiResponse({ status: 200, description: 'Charge point ended successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Charge point not found' })
  async endChargePoint(@Body() body: EndChargingDto) {
    const { charge_point_id, end_time } = body;
    return await this.staffService.endChargePoint(charge_point_id, end_time);
  }

  //______________________________________INCIDENT REPORT______________________________________
  
  @Post('/create-incident-report')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an incident report' })
  @ApiResponse({ status: 201, description: 'Incident report created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createIncidentReport(@Body() body: CreateIncidentReportDto) {
    return await this.incidentReportService.createIncidentReport(body);
  }

  @Put('/update-incident-report-status')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update incident report status' })
  @ApiResponse({ status: 200, description: 'Incident report status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Incident report not found' })
  async updateIncidentReportStatus(@Body() body: UpdateReportStatusDto) {
    return await this.incidentReportService.updateIncidentReportStatus(
      body.report_id,
      body.status,
    );
  }

  @Get('/get-incident-reports')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get incident reports by charge point, staff, or station' })
  @ApiQuery({ name: 'charge_point_id', required: false, description: 'Filter by charge point ID' })
  @ApiQuery({ name: 'staff_id', required: false, description: 'Filter by staff ID' })
  @ApiQuery({ name: 'station_id', required: false, description: 'Filter by station ID' })
  @ApiResponse({ status: 200, description: 'List of incident reports retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
