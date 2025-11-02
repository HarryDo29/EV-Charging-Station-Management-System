import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Body } from '@nestjs/common';
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

@Controller('/station')
export class StationController {
  constructor(
    private readonly stationService: StationService,
    private readonly chargePointService: ChargePointService,
    private readonly reservationService: ReservationService,
  ) {}

  //___________________________________________STATION___________________________________________
  // create station
  @Post('')
  // @UseGuards(AuthGuard('jwt'))
  // @Roles(Role.ADMIN)
  createStation(@Body() stations: CreateStationDto[]) {
    console.log('stations:', stations.length);
    return this.stationService.createStation(stations);
  }

  // get all stations
  @Get('/get-all-stations')
  async getAllStations() {
    return await this.stationService.getAllStations();
  }

  // get stations neareast
  @Get('/')
  async getStationsNeareast(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
  ) {
    return await this.stationService.findStationsNeareast(
      Number(latitude),
      Number(longitude),
    );
  }

  // get station by id
  @Get('/:id')
  async getStationById(@Param('id') id: string) {
    return await this.stationService.getStationById(id);
  }

  // update station (admin)
  @Put('/:id/update-station')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN)
  updateStation(@Param('id') id: string, @Body() station: UpdateStationDto) {
    return this.stationService.updateStation(id, station);
  }

  // update station status (admin, staff)
  @Put('/:id/update-station-status')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN, Role.STAFF)
  updateStationStatus(@Param('id') id: string, @Body() status: StationStatus) {
    return this.stationService.updateStationStatus(id, status);
  }

  //___________________________________________CHARGE-POINT___________________________________________
  // create charge-points
  @Post('/create-charge-points')
  // @UseGuards(AuthGuard('jwt'))
  // @Roles(Role.ADMIN)
  createChargePoints(@Body() chargePoints: CreateChargePointDto[]) {
    return this.chargePointService.createChargePoints(chargePoints);
  }

  // create charge-point
  // @Post('/:stationId/create-charge-point')
  // @UseGuards(AuthGuard('jwt'))
  // @Roles(Role.ADMIN)
  // createChargePoint(
  //   @Body() chargePoint: CreateChargePointDto,
  //   @Param('stationId') stationId: string,
  // ) {
  //   chargePoint.station_id = stationId;
  //   return this.chargePointService.createChargePoint(chargePoint);
  // }

  // get charge-points by station id
  @Get('/get-charge-points/:stationId')
  @UseGuards(AuthGuard('jwt'))
  getChargePointsByStationId(@Param('stationId') stationId: string) {
    return this.chargePointService.getChargePointsByStationId(stationId);
  }

  // update charge-point (admin)
  @Put('/:stationId/update-charge-point/:identifier')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN)
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

  // update charge-point status (admin, staff)
  @Put('/:stationId/update-charge-point-status/:identifier')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN, Role.STAFF)
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
  // create reservation
  @Post('/reservation')
  @UseGuards(AuthGuard('jwt'))
  createReservation(
    @Req() req: RequestExpress,
    @Body() createReservation: CreateReservationDto,
  ) {
    const acc = req.user as AuthenticatedUserDto;
    return this.reservationService.createReservation(acc.id, createReservation);
  }

  // get reservation of week
  @Get('/reservation/:chargePointId')
  @UseGuards(AuthGuard('jwt'))
  getReservationOfWeek(@Param('chargePointId') chargePointId: string) {
    console.log('chargePointId', chargePointId);
    return this.reservationService.getReservationOfWeek(chargePointId);
  }

  //___________________________________________CHARGING-SESSION___________________________________________
  // start charging
  @Post('/charging-session/start')
  @UseGuards(AuthGuard('jwt'))
  startCharging(@Body() body: CreateChargingSessionDto) {
    return this.chargePointService.startCharging(body);
  }

  // end charging
  @Post('/charging-session/end')
  @UseGuards(AuthGuard('jwt'))
  endCharging(@Body() body: EndChargingSessionDto) {
    return this.chargePointService.endCharging(body);
  }
}
