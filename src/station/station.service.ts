import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ArrayOverlap,
  Between,
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
    query.where('station.latitude BETWEEN :startLatitude AND :endLatitude', {
      startLatitude: latitude - latErrRange,
      endLatitude: latitude + latErrRange,
    });
    query.andWhere(
      'station.longitude BETWEEN :startLongitude AND :endLongitude',
      {
        startLongitude: longitude - lonErrRange,
        endLongitude: longitude + lonErrRange,
      },
    );
    const station = await query.getOne();
    return station ? true : false;
  }

  // create station
  async createStation(station: CreateStationDto): Promise<StationEntity> {
    // check if station is duplicate
    const isDuplicate = await this.checkDuplicateStation(
      station.latitude,
      station.longitude,
    );
    if (isDuplicate) {
      throw new BadRequestException('Station is duplicate');
    }
    const nStation = this.stationRepo.create({ ...station });
    return await this.stationRepo.save(nStation);
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

  // get stations around 1km (default) or take from request
  async getStationsAround(
    latitude: number,
    longitude: number,
    radisusKm: number = 1, // default 1km
  ): Promise<StationEntity[]> {
    // latitude: km to degree
    const latErrRange = radisusKm / 111.32;
    const latToRadian = latitude * (Math.PI / 180);
    // longitude: km to degree
    const lonErrRange = radisusKm / (111.32 * Math.cos(latToRadian));
    // return stations around 1km (default) or take from request
    return await this.stationRepo.find({
      where: {
        latitude: Between(latitude - latErrRange, latitude + latErrRange),
        longitude: Between(longitude - lonErrRange, longitude + lonErrRange),
      },
    });
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
