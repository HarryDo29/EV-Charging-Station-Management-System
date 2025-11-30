import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ArrayOverlap,
  FindOptionsWhere,
  In,
  LessThanOrEqual,
  Repository,
  UpdateResult,
} from 'typeorm';
import { StationEntity } from './entity/station.entity';
import { CreateStationDto } from './dto/station/createStation.dto';
import { UpdateStationDto } from './dto/station/updateStation.dto';
import { ConnectorType } from 'src/enums/connector.enum';
import { StationStatus } from 'src/enums/stationStatus.enum';
import { FilterStationDto } from './dto/station/filterStation.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class StationService {
  constructor(
    @InjectRepository(StationEntity)
    private readonly stationRepo: Repository<StationEntity>,
  ) {}

  // check if station is duplicate in 0.1 km (radius)
  async checkDuplicateStation(
    latitude: number,
    longitude: number,
  ): Promise<boolean> {
    // latitude: 0.1 km to degree
    const latErrRange = 0.1 / 111.32;
    const latToRadian = latitude * (Math.PI / 180);
    // longitude: 0.1 km to degree
    const lonErrRange = 0.1 / (111.32 * Math.cos(latToRadian));
    // check if station is within 0.1 km
    const query = this.stationRepo.createQueryBuilder('station');
    query.where('station.coordinates[0] BETWEEN :startLat AND :endLat', {
      startLat: latitude - latErrRange,
      endLat: latitude + latErrRange,
    });
    query.andWhere('station.coordinates[1] BETWEEN :startLong AND :endLong', {
      startLong: longitude - lonErrRange,
      endLong: longitude + lonErrRange,
    });
    const station = await query.getOne();
    return station ? true : false;
  }

  // create station
  async createStation(stations: CreateStationDto[]): Promise<StationEntity[]> {
    // check if station is duplicate
    const nStations: StationEntity[] = [];
    for (const station of stations) {
      // console.log('station', station);
      const isDuplicate = await this.checkDuplicateStation(
        station.latitude,
        station.longitude,
      );
      if (isDuplicate) {
        throw new BadRequestException('Station is duplicate');
      }
      const stationEntity = plainToInstance(StationEntity, station);
      stationEntity.setCoordinates(station.longitude, station.latitude);
      const nStation = await this.stationRepo.save(stationEntity);
      nStations.push(nStation);
    }
    return nStations;
  }

  // get all stations (sorted by distance if user location provided)
  async getAllStations(
    userLatitude?: number,
    userLongitude?: number,
  ): Promise<StationEntity[]> {
    // If user location is provided, sort by distance
    if (userLatitude !== undefined && userLongitude !== undefined) {
      const stations = await this.stationRepo
        .createQueryBuilder('station')
        .addSelect(
          `ST_DistanceSphere(station.coordinates, ST_SetSRID(ST_MakePoint(${userLongitude}, ${userLatitude}), 4326))`,
          'distance',
        )
        .orderBy('distance', 'ASC')
        .getMany();
      return stations;
    }
    return await this.stationRepo.find();
  }

  // update station (all fields)
  async updateStation(
    id: string,
    station: UpdateStationDto,
  ): Promise<UpdateResult> {
    const foundStation = await this.getStationById(id);
    if (!foundStation) {
      throw new NotFoundException('Station not found');
    }
    const updatedStation = await this.stationRepo.update(id, { ...station });
    if (updatedStation.affected === 0) {
      throw new NotFoundException('Nothing updated');
    }
    return updatedStation;
  }

  // update station status
  async updateStationStatus(
    id: string,
    status: StationStatus,
  ): Promise<UpdateResult> {
    const foundStation = await this.getStationById(id);
    if (!foundStation) {
      throw new NotFoundException('Station not found');
    }
    const updatedStation = await this.stationRepo.update(id, { status });
    if (updatedStation.affected === 0) {
      throw new NotFoundException('Nothing updated');
    }
    return updatedStation;
  }

  async getStationById(id: string): Promise<StationEntity | null> {
    return await this.stationRepo.findOne({ where: { id } });
  }

  async getStationsByConnectorType(
    connectorType: ConnectorType[],
  ): Promise<StationEntity[]> {
    return await this.stationRepo.find({
      where: { connectorTypes: In([connectorType]) },
    });
  }

  async getStationsByFilter(
    filterStationDto: FilterStationDto,
  ): Promise<StationEntity[]> {
    const { connectorTypes, pricePerKwh, powerKw } = filterStationDto;

    // create where clause for filter
    const where: FindOptionsWhere<StationEntity> = {
      status: StationStatus.AVAILABLE,
    };

    if (connectorTypes) {
      where.connectorTypes = ArrayOverlap(connectorTypes);
    }

    if (pricePerKwh) {
      where.pricePerKwh = LessThanOrEqual(pricePerKwh);
    }

    if (powerKw) {
      where.powerKw = LessThanOrEqual(powerKw);
    }

    return await this.stationRepo.find({
      where,
      relations: ['charge_points'],
    });
  }
}
