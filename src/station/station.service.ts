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
      const nStation = this.stationRepo.create({ ...station });
      nStations.push(nStation);
      await this.stationRepo.save(nStation);
    }
    return nStations;
  }

  // calculate distance between two points using Haversine formula (in km)
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // get all stations (sorted by distance if user location provided)
  async getAllStations(
    userLatitude?: number,
    userLongitude?: number,
  ): Promise<StationEntity[]> {
    const stations = await this.stationRepo.find();

    // If user location is provided, sort by distance
    if (userLatitude !== undefined && userLongitude !== undefined) {
      return stations
        .map((station) => ({
          ...station,
          distance: this.calculateDistance(
            userLatitude,
            userLongitude,
            station.latitude,
            station.longitude,
          ),
        }))
        .sort((a, b) => a.distance - b.distance);
    }

    return stations;
  }

  // get station increasing order by (latitude, longitude)
  // async findStationsNeareast(
  //   latitude: number,
  //   longitude: number,
  // ): Promise<StationEntity[]> {
  //   const distanceAround = 5; // 5km
  //   const stations = await this.stationRepo
  //     .createQueryBuilder('station')
  //     .addSelect(
  //       `ST_Distance(POINT(station.longitude, station.latitude), POINT(${longitude}, ${latitude})) / 1000`, // Chia 1000 để đổi ra km
  //       'distance_in_km', // Đặt tên cho cột "ảo"
  //     )
  //     .where(
  //       `ST_DWithin(POINT(station.longitude, station.latitude), POINT(${longitude}, ${latitude}), :radius)`,
  //       { radius: distanceAround * 1000 },
  //     )
  //     .orderBy('distance_in_km', 'ASC')
  //     .take(20)
  //     .skip(0)
  //     .getMany();
  //   return stations;
  // }

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
