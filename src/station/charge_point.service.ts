import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { StationEntity } from './entity/station.entity';
import { ChargePointEntity } from './entity/charge_point.entity';
import { CreateChargePointDto } from './dto/charge_point/createChargePoint.dto';
import { UpdateChargePointDto } from './dto/charge_point/updateChargePoint.dto';
import { StationStatus } from 'src/enums/stationStatus.enum';
import { ReservationEntity } from './entity/reservation.entity';
import { RedisService } from 'src/redis/redis.service';
import { ReservationStatus } from 'src/enums/reservation.enum';
// import { MailService } from 'src/mail/mail.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { ChargingSessionEntity } from './entity/charging_session.entity';
import { CreateChargingSessionDto } from './dto/charging_session/createChargingSession.dto';
import { EndChargingSessionDto } from './dto/charging_session/endChargingSession.dto';
import { SessionStatus } from 'src/enums/sessionStatus.enum';
import { parse } from 'date-fns';

@Injectable()
export class ChargePointService {
  constructor(
    @InjectRepository(ChargePointEntity)
    private readonly chargePointRepo: Repository<ChargePointEntity>,
    @InjectRepository(StationEntity)
    private readonly stationRepo: Repository<StationEntity>,
    @InjectRepository(ReservationEntity)
    private readonly reservationRepo: Repository<ReservationEntity>,
    private readonly redisService: RedisService,
    @InjectRepository(ChargingSessionEntity)
    private readonly chargingSessionRepo: Repository<ChargingSessionEntity>,
    //private readonly mailService:MailService,
    private readonly transactionService: TransactionService,
  ) {}

  // create charge-points from array of charge-points
  async createChargePoints(
    chargePoints: CreateChargePointDto[],
  ): Promise<ChargePointEntity[]> {
    const nChargePoints: ChargePointEntity[] = [];
    for (const chargePoint of chargePoints) {
      console.log('chargePointDTO', chargePoint);
      const nChargePoint = await this.createChargePoint(chargePoint);
      nChargePoints.push(nChargePoint);
    }
    return nChargePoints;
  }

  // create charge-point with identifer and station
  async createChargePoint(
    chargePoint: CreateChargePointDto,
  ): Promise<ChargePointEntity> {
    // find Station by station id
    console.log('chargePoint.identifer', chargePoint.identifer);
    const station = await this.stationRepo.findOne({
      where: { identifier: chargePoint.identifer },
      relations: ['charge_points'],
    });
    console.log('station', station);
    if (!station) {
      throw new NotFoundException('Station not found');
    }
    // create identifier of charge point
    const identifier = `${station.identifier}-${String(station.charge_points.length + 1).padStart(2, '0')}`;
    // check connector type is exists in station
    if (!station.connectorTypes.includes(chargePoint.connector_type)) {
      station.connectorTypes.push(chargePoint.connector_type);
      await this.stationRepo.save(station);
    }
    // create charge point
    const nChargePoint = this.chargePointRepo.create({
      ...chargePoint,
      identifier: identifier,
      station: station,
    });
    await this.stationRepo.update(station.id, {
      totalChargePoints: station.totalChargePoints + 1,
      availableChargePoints:
        chargePoint.status === StationStatus.AVAILABLE
          ? station.availableChargePoints + 1
          : station.availableChargePoints,
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
      where: { identifier: identifier, station: { id: stationId } },
    });
  }

  // get charge-points by station id
  async getChargePointsByStationId(
    stationId: string,
  ): Promise<ChargePointEntity[]> {
    return await this.chargePointRepo.find({
      where: { station: { id: stationId } },
    });
  }

  // update charge-point (all fields)
  async updateChargePoint(
    identifier: string,
    stationId: string,
    chargePoint: UpdateChargePointDto,
  ): Promise<UpdateResult> {
    const updatedChargePoint = await this.chargePointRepo.update(
      { identifier: identifier, station: { id: stationId } },
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
      { identifier: identifier, station: { id: stationId } },
      { status },
    );
    if (updatedChargePoint.affected === 0) {
      throw new NotFoundException('Nothing updated');
    }
    return updatedChargePoint;
  }

  // calculate the total time of reservation
  calculateTotalTime(start_time: Date, end_time: Date): number {
    const totalTime = end_time.getTime() - start_time.getTime();
    return totalTime;
  }

  /*
  tính toán thời gian sạc:
    vd: tổng thời gian sạc là 100kWh thì sẽ mỗi 20kWh sẽ tính tiền giảm 20% trên đơn giá
        và mặc định sau 3h thì sẽ tính ở mức mặc định và có phụ phí mỗi 5kWh để tránh tài xế lấy chỗ sạc làm chỗ gửi xe
  */

  // calculate time charging and total price
  calChargingTimeAndPrice(
    chargingSession: ChargingSessionEntity,
    chargingTime: number,
  ): {
    totalKwh: number;
    chargingPrice: number;
    parkingFee: number;
    totalPrice: number;
  } {
    // calculate total price
    const totalKwh = chargingSession.charge_point.maxPowerKw * chargingTime;
    const chargingPrice = totalKwh * chargingSession.charge_point.pricePerKwh;
    const parkingFee =
      chargingTime * chargingSession.charge_point.parkingFeePerHour;
    const totalPrice = chargingPrice + parkingFee;
    return { totalKwh, chargingPrice, parkingFee, totalPrice };
  }

  // start charging
  async startCharging(
    chargingSession: CreateChargingSessionDto,
  ): Promise<ChargingSessionEntity> {
    const { reservation_id, start_time, day } = chargingSession;
    // get reservation
    const reservation = await this.reservationRepo.findOne({
      where: {
        id: reservation_id,
        status: ReservationStatus.PENDING,
        start_time: start_time,
        reservation_day: day,
      },
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    // create charging session
    const nChargingSession = this.chargingSessionRepo.create({
      charge_point: reservation.charge_point,
      reservation: reservation,
      start_time: start_time,
      day: day,
    });
    // update reservation status && set reservation to redis
    await Promise.all([
      // create charging session (save to db)
      this.chargingSessionRepo.save(nChargingSession),
      // update reservation status
      this.reservationRepo.update(reservation_id, {
        status: ReservationStatus.RESERVED,
      }),
      // set reservation start time to redis
      this.redisService.set(`StartCharging:${reservation_id}`, start_time),
    ]);
    return nChargingSession;
  }

  // end charging
  async endCharging(chargingSessionDto: EndChargingSessionDto): Promise<{
    chargingPrice: number;
    parkingFee: number;
    totalPrice: number;
    accountId: string;
  }> {
    const { charging_session_id, end_time } = chargingSessionDto;
    // get charging session
    const chargingSession = await this.chargingSessionRepo.findOne({
      where: {
        id: charging_session_id,
        status: SessionStatus.IN_PROGRESS,
      },
      relations: ['reservation'],
    });
    if (!chargingSession) {
      throw new NotFoundException('Charging session not found');
    }
    // get reservation
    const reservation = await this.reservationRepo.findOne({
      where: { id: chargingSession.reservation.id },
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    // get start charging time from redis
    const startChargingTime = await this.redisService.get(
      `StartCharging:${reservation.id}`,
    );
    if (!startChargingTime) {
      throw new NotFoundException('Start charging time not found');
    }
    // calculate charging time
    const chargingTime =
      (parse(end_time, 'HH:mm', new Date()).getTime() -
        parse(startChargingTime, 'HH:mm', new Date()).getTime()) /
      (1000 * 60 * 60);
    // total price
    const { totalKwh, chargingPrice, parkingFee, totalPrice } =
      this.calChargingTimeAndPrice(chargingSession, chargingTime);
    // update
    await Promise.all([
      // update charging session
      this.chargingSessionRepo.update(chargingSession.id, {
        end_time: end_time,
        total_time: chargingTime,
        energy_consumed_kwh: totalKwh,
        total_price: totalPrice,
      }),
      // update reservation status
      this.reservationRepo.update(reservation.id, {
        status: ReservationStatus.COMPLETED,
      }),
    ]);
    // remove reservation from redis
    await this.redisService.del(`StartCharging:${reservation.id}`);
    return {
      chargingPrice,
      parkingFee,
      totalPrice,
      accountId: reservation.account.id,
    };
  }
}
