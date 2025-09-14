import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
  Delete,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/createdCar.dto';
import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';
import type { Request as RequestExpress } from 'express';
// import { ConnectorType } from 'src/enums/connector.enum';
import { SearchVehicleDto } from './dto/searchVehicle.dto';

@Controller('/vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post('/add-vehicle')
  @UseGuards(AuthGuard('jwt'))
  createVehicle(
    @Body() createVehicleDto: CreateVehicleDto,
    @Request() req: RequestExpress,
  ) {
    const acc = req.user as AuthenticatedUserDto;
    createVehicleDto.account_id = acc.id;
    return this.vehicleService.createVehicle(createVehicleDto);
  }

  @Get('/get-all-vehicles')
  @UseGuards(AuthGuard('jwt'))
  getAllVehicles(@Request() req: RequestExpress) {
    const acc = req.user as AuthenticatedUserDto;
    return this.vehicleService.findAllVehicles(acc.id);
  }

  @Get('/get-vehicle')
  @UseGuards(AuthGuard('jwt'))
  searchVehicle(@Query() query: SearchVehicleDto) {
    const { car_makes, connector_type } = query;
    // const acc = req.user as AuthenticatedUserDto;
    return this.vehicleService.searchVehicles({
      car_makes,
      connector_type,
    });
  }

  @Delete('/delete-vehicle/:id/:status')
  @UseGuards(AuthGuard('jwt'))
  deleteVehicle(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('status') status: boolean,
  ) {
    return this.vehicleService.updateVehicleStatus(id, status);
  }
}
