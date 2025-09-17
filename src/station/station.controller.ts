import { Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
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

@Controller('station')
export class StationController {
  constructor(
    private readonly stationService: StationService,
    private readonly chargePointService: ChargePointService,
  ) {}

  // STATION
  // create station
  @Post('/create-station')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN)
  createStation(@Body() station: CreateStationDto) {
    return this.stationService.createStation(station);
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

  // CHARGE-POINT
  // create charge-point
  @Post('/:stationId/create-charge-point')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN)
  createChargePoint(
    @Body() chargePoint: CreateChargePointDto,
    @Param('stationId') stationId: string,
  ) {
    chargePoint.station_id = stationId;
    return this.chargePointService.createChargePoint(chargePoint);
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
}
