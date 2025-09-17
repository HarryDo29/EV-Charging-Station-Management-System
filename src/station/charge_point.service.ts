import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { StationEntity } from './entity/station.entity';
import { ChargePointEntity } from './entity/charge_point.entity';
import { CreateChargePointDto } from './dto/charge_point/createChargePoint.dto';
import { UpdateChargePointDto } from './dto/charge_point/updateChargePoint.dto';
import { StationStatus } from 'src/enums/stationStatus.enum';

@Injectable()
export class ChargePointService {
  constructor(
    @InjectRepository(ChargePointEntity)
    private readonly chargePointRepo: Repository<ChargePointEntity>,
    @InjectRepository(StationEntity)
    private readonly stationRepo: Repository<StationEntity>,
  ) {}

  // create charge-point with identifier and station
  async createChargePoint(
    chargePoint: CreateChargePointDto,
  ): Promise<ChargePointEntity> {
    // find Station by station id
    const station = await this.stationRepo.findOne({
      where: { id: chargePoint.station_id },
      relations: ['charge_points'],
    });
    if (!station) {
      throw new NotFoundException('Station not found');
    }
    // create identifier of charge point
    const identifier = `${station.identifier}-${String(station.charge_points.length + 1).padStart(2, '0')}`;
    // create charge point
    const nChargePoint = this.chargePointRepo.create({
      ...chargePoint,
      identifier: identifier,
      station: station,
    });
    return await this.chargePointRepo.save(nChargePoint);
  }

  // find charge-point by identifier and station id
  async getChargePointById(
    identifier: string,
    stationId: string,
  ): Promise<ChargePointEntity | null> {
    // find Station by station id
    return await this.chargePointRepo.findOne({
      where: { identifier: identifier, station_id: stationId },
    });
  }

  // get charge-points by station id
  async getChargePointsByStationId(
    stationId: string,
  ): Promise<ChargePointEntity[]> {
    return await this.chargePointRepo.find({
      where: { station_id: stationId },
    });
  }

  // update charge-point (all fields)
  async updateChargePoint(
    identifier: string,
    stationId: string,
    chargePoint: UpdateChargePointDto,
  ): Promise<UpdateResult> {
    const updatedChargePoint = await this.chargePointRepo.update(
      { identifier: identifier, station_id: stationId },
      chargePoint,
    );
    if (updatedChargePoint.affected === 0) {
      throw new NotFoundException('Nothing updated');
    }
    return updatedChargePoint;
  }

  // update charge-point status
  async updateChargePointStatus(
    identifier: string,
    stationId: string,
    status: StationStatus,
  ): Promise<UpdateResult> {
    const updatedChargePoint = await this.chargePointRepo.update(
      { identifier: identifier, station_id: stationId },
      { status },
    );
    if (updatedChargePoint.affected === 0) {
      throw new NotFoundException('Nothing updated');
    }
    return updatedChargePoint;
  }
}
