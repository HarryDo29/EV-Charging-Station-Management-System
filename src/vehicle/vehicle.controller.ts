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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/createdCar.dto';
import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';
import type { Request as RequestExpress } from 'express';
// import { ConnectorType } from 'src/enums/connector.enum';
import { SearchVehicleDto } from './dto/searchVehicle.dto';

@ApiTags('Vehicle')
@Controller('/vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post('/add-vehicle')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new vehicle to user account' })
  @ApiResponse({ status: 201, description: 'Vehicle created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid vehicle data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createVehicle(
    @Body() createVehicleDto: CreateVehicleDto,
    @Request() req: RequestExpress,
  ) {
    const acc = req.user as AuthenticatedUserDto;
    console.log('vehicle controller createVehicleDto', createVehicleDto);
    return this.vehicleService.createVehicle(createVehicleDto, acc.id);
  }

  @Get('/get-all-vehicles')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all vehicles of current user' })
  @ApiResponse({ status: 200, description: 'List of vehicles retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAllVehicles(@Request() req: RequestExpress) {
    const acc = req.user as AuthenticatedUserDto;
    return this.vehicleService.findAllVehicles(acc.id);
  }

  @Get('/get-vehicle')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search vehicles by car maker and connector type' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update vehicle status (soft delete)' })
  @ApiParam({ name: 'id', description: 'Vehicle ID', type: 'string' })
  @ApiParam({ name: 'status', description: 'New status', type: 'boolean' })
  @ApiResponse({ status: 200, description: 'Vehicle status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  deleteVehicle(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('status') status: boolean,
  ) {
    return this.vehicleService.updateVehicleStatus(id, status);
  }
}
