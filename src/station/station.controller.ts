import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StationService } from './station.service';
import { ChargePointService } from './charge_point.service';
import { CreateStationDto } from './dto/station/createStation.dto';
import { CreateChargePointDto } from './dto/charge_point/createChargePoint.dto';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/enums/role.enum';
import { Roles } from 'src/auth/decorator/role.decorator';
import { UpdateStationDto } from './dto/station/updateStation.dto';
import { StationStatus } from 'src/enums/stationStatus.enum';
import { UpdateChargePointDto } from './dto/charge_point/updateChargePoint.dto';
import { CreateChargingSessionDto } from './dto/charging_session/createChargingSession.dto';
import { EndChargingSessionDto } from './dto/charging_session/endChargingSession.dto';
import { CreateReservationDto } from './dto/reservation/createReservation.dto';
import type { Request as RequestExpress } from 'express';
import { ReservationService } from './reservation.service';
import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';

@ApiTags('Station')
@Controller('/station')
export class StationController {
  constructor(
    private readonly stationService: StationService,
    private readonly chargePointService: ChargePointService,
    private readonly reservationService: ReservationService,
  ) {}

  //___________________________________________STATION___________________________________________
  @Post('')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new charging stations (Admin only)' })
  @ApiResponse({ status: 201, description: 'Stations created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid station data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  createStation(@Body() stations: CreateStationDto[]) {
    console.log('stations:', stations.length);
    return this.stationService.createStation(stations);
  }

  @Get('')
  @ApiOperation({
    summary: 'Get all charging stations (optionally sorted by distance)',
  })
  @ApiQuery({
    name: 'latitude',
    required: false,
    description: 'User latitude for distance sorting',
  })
  @ApiQuery({
    name: 'longitude',
    required: false,
    description: 'User longitude for distance sorting',
  })
  @ApiResponse({
    status: 200,
    description: 'List of stations retrieved successfully',
  })
  async getAllStationsWithoutLocation() {
    return await this.stationService.getAllStations();
  }

  @Get('/sorted')
  @ApiOperation({
    summary: 'Get all stations sorted by distance from user location',
  })
  @ApiQuery({
    name: 'latitude',
    required: true,
    description: 'User latitude',
  })
  @ApiQuery({
    name: 'longitude',
    required: true,
    description: 'User longitude',
  })
  @ApiResponse({
    status: 200,
    description: 'Sorted list of stations retrieved successfully',
  })
  async getStationsSorted(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    return await this.stationService.getAllStations(lat, lon);
  }

  @Get('')
  @ApiOperation({
    summary: 'Get all stations (with optional location sorting)',
  })
  @ApiQuery({ name: 'latitude', required: false, description: 'User latitude' })
  @ApiQuery({
    name: 'longitude',
    required: false,
    description: 'User longitude',
  })
  @ApiResponse({
    status: 200,
    description: 'List of stations retrieved successfully',
  })
  async getAllStations(
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
  ) {
    const lat = latitude ? parseFloat(latitude) : undefined;
    const lon = longitude ? parseFloat(longitude) : undefined;
    return await this.stationService.getAllStations(lat, lon);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get station details by ID' })
  @ApiParam({ name: 'id', description: 'Station ID' })
  @ApiResponse({
    status: 200,
    description: 'Station details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Station not found' })
  async getStationById(@Param('id') id: string) {
    return await this.stationService.getStationById(id);
  }

  @Put('/:id/update-station')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update station information (Admin only)' })
  @ApiParam({ name: 'id', description: 'Station ID' })
  @ApiResponse({ status: 200, description: 'Station updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  updateStation(@Param('id') id: string, @Body() station: UpdateStationDto) {
    return this.stationService.updateStation(id, station);
  }

  @Put('/:id/update-station-status')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update station status (Admin/Staff only)' })
  @ApiParam({ name: 'id', description: 'Station ID' })
  @ApiResponse({
    status: 200,
    description: 'Station status updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin/Staff role required',
  })
  @ApiResponse({ status: 404, description: 'Station not found' })
  updateStationStatus(@Param('id') id: string, @Body() status: StationStatus) {
    return this.stationService.updateStationStatus(id, status);
  }

  //___________________________________________CHARGE-POINT___________________________________________
  @Post('/create-charge-points')
  // @UseGuards(AuthGuard('jwt'))
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create multiple charge points' })
  @ApiResponse({
    status: 201,
    description: 'Charge points created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid charge point data' })
  createChargePoints(@Body() chargePoints: CreateChargePointDto[]) {
    return this.chargePointService.createChargePoints(chargePoints);
  }

  @Get('/get-charge-points/:stationId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all charge points at a station' })
  @ApiParam({ name: 'stationId', description: 'Station ID' })
  @ApiResponse({
    status: 200,
    description: 'List of charge points retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  getChargePointsByStationId(@Param('stationId') stationId: string) {
    return this.chargePointService.getChargePointsByStationId(stationId);
  }

  @Put('/:stationId/update-charge-point/:identifier')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update charge point information (Admin only)' })
  @ApiParam({ name: 'stationId', description: 'Station ID' })
  @ApiParam({ name: 'identifier', description: 'Charge point identifier' })
  @ApiResponse({
    status: 200,
    description: 'Charge point updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({ status: 404, description: 'Charge point not found' })
  updateChargePoint(
    @Param('stationId') stationId: string,
    @Param('identifier') identifier: string,
    @Body() chargePoint: UpdateChargePointDto,
  ) {
    return this.chargePointService.updateChargePoint(
      identifier,
      stationId,
      chargePoint,
    );
  }

  @Put('/:stationId/update-charge-point-status/:identifier')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update charge point status (Admin/Staff only)' })
  @ApiParam({ name: 'stationId', description: 'Station ID' })
  @ApiParam({ name: 'identifier', description: 'Charge point identifier' })
  @ApiResponse({
    status: 200,
    description: 'Charge point status updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin/Staff role required',
  })
  @ApiResponse({ status: 404, description: 'Charge point not found' })
  updateChargePointStatus(
    @Param('stationId') stationId: string,
    @Param('identifier') identifier: string,
    @Body() status: StationStatus,
  ) {
    return this.chargePointService.updateChargePointStatus(
      identifier,
      stationId,
      status,
    );
  }

  //______________________________________________RESERVATION_____________________________________________

  @Post('/reservation')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a charging reservation' })
  @ApiResponse({
    status: 201,
    description: 'Reservation created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid reservation data or time slot not available',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'Charge point or vehicle not found',
  })
  createReservation(
    @Req() req: RequestExpress,
    @Body() createReservation: CreateReservationDto,
  ) {
    const acc = req.user as AuthenticatedUserDto;
    return this.reservationService.createReservation(acc.id, createReservation);
  }

  @Get('/reservation/:chargePointId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get reservations for a charge point for the current week',
  })
  @ApiParam({ name: 'chargePointId', description: 'Charge point ID' })
  @ApiResponse({
    status: 200,
    description: 'Reservations retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Charge point not found' })
  getReservationOfWeek(@Param('chargePointId') chargePointId: string) {
    console.log('chargePointId', chargePointId);
    return this.reservationService.getReservationOfWeek(chargePointId);
  }

  //___________________________________________CHARGING-SESSION___________________________________________
  @Post('/charging-session/start')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a charging session' })
  @ApiResponse({
    status: 201,
    description: 'Charging session started successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or reservation not found',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  startCharging(@Body() body: CreateChargingSessionDto) {
    return this.chargePointService.startCharging(body);
  }

  @Post('/charging-session/end')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'End a charging session' })
  @ApiResponse({
    status: 200,
    description: 'Charging session ended successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Charging session not found' })
  endCharging(@Body() body: EndChargingSessionDto) {
    return this.chargePointService.endCharging(body);
  }
}
