import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { StationEntity } from './entity/station.entity';
import { ChargePointEntity } from './entity/charge_point.entity';
import { CreateChargePointDto } from './dto/charge_point/createChargePoint.dto';
import { UpdateChargePointDto } from './dto/charge_point/updateChargePoint.dto';
import { StationStatus } from 'src/enums/stationStatus.enum';
import { CreateReservationDto } from './dto/reservation/createReservation.dto';
import { ReservationEntity } from './entity/reservation.entity';
import { RedisService } from 'src/redis/redis.service';
import { ReservationStatus } from 'src/enums/reservation.enum';
import { MailService } from 'src/mail/mail.service';
import { TransactionService } from 'src/transaction/transaction.service';

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
    private readonly mailService: MailService,
    private readonly transactionService: TransactionService,
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

  // calculate the total time of reservation
  calculateTotalTime(start_time: Date, end_time: Date): number {
    const totalTime = end_time.getTime() - start_time.getTime();
    return totalTime;
  }

  // check duplicated reservation
  async checkDuplicatedReservation(
    reservation_day: string,
    charge_point_id: string,
    start_time: Date,
    end_time: Date,
  ): Promise<boolean> {
    const reservation = await this.reservationRepo.find({
      where: {
        reservation_day: reservation_day,
        charge_point_id: charge_point_id,
        status: ReservationStatus.PENDING,
      },
    });
    // check start time: if in range of start_time and end_time in another reservation
    // check end time: if in range of start_time and end_time in another reservation
    for (const res of reservation) {
      // check start time - if start_time is in range of start_time and end_time in another reservation return false
      if (res.start_time <= start_time && res.end_time >= start_time) {
        return false;
      }
      // check end time - if end_time is in range of start_time and end_time in another reservation return false
      if (res.start_time <= end_time && res.end_time >= end_time) {
        return false;
      }
    }
    return true;
  }

  // create reservation (only available and not reserved)
  async createReservation(
    accountId: string,
    reservation: CreateReservationDto,
  ) {
    const { reservation_day, charge_point_id, start_time, end_time } =
      reservation;
    const chargePoint = await this.chargePointRepo.findOne({
      where: {
        id: charge_point_id,
        status: StationStatus.AVAILABLE,
        reserved_status: false,
      },
    });
    if (!chargePoint) {
      throw new NotFoundException('Charge point not available');
    }
    // check duplicated reservation
    const isDuplicated = await this.checkDuplicatedReservation(
      reservation_day,
      charge_point_id,
      start_time,
      end_time,
    );
    if (isDuplicated) {
      throw new BadRequestException('Reservation is duplicated');
    }
    // create reservation
    const nReservation = this.reservationRepo.create({
      reservation_day: reservation_day,
      start_time: start_time,
      end_time: end_time,
      account_id: accountId,
      charge_point_id: charge_point_id,
      total_time: this.calculateTotalTime(start_time, end_time),
    });
    // send email to account
    await this.mailService.sendBookingConfirmation(
      nReservation.account.email,
      nReservation,
    );
    return await this.reservationRepo.save(nReservation);
  }

  /*
  tính toán thời gian sạc:
    vd: tổng thời gian sạc là 100kWh thì sẽ mỗi 20kWh sẽ tính tiền giảm 20% trên đơn giá
        và mặc định sau 3h thì sẽ tính ở mức mặc định và có phụ phí mỗi 5kWh để tránh tài xế lấy chỗ sạc làm chỗ gửi xe
  */

  // calculate time charging and total price
  async calChargingTimeAndPrice(
    reservationId: string,
    chargingTime: number,
  ): Promise<{
    chargingPrice: number;
    parkingFee: number;
    totalPrice: number;
  }> {
    const reservation = await this.reservationRepo.findOne({
      where: { id: reservationId },
      relations: ['charge_point'],
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    // calculate total price
    const totalKwh = reservation.charge_point.max_power_kw * chargingTime;
    const chargingPrice = totalKwh * reservation.charge_point.price_per_kwh;
    const parkingFee =
      chargingTime * reservation.charge_point.parking_fee_per_hour;
    const totalPrice = chargingPrice + parkingFee;
    return { chargingPrice, parkingFee, totalPrice };
  }

  // start charging
  async startCharging(reservationId: string): Promise<void> {
    const reservation = await this.reservationRepo.findOne({
      where: { id: reservationId },
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    // update reservation status && set reservation to redis
    await Promise.all([
      this.reservationRepo.update(reservationId, {
        status: ReservationStatus.RESERVED,
      }),
      this.redisService.set(
        `StartCharging:${reservationId}`,
        new Date().toISOString(),
      ),
    ]);
  }

  // end charging
  async endCharging(reservationId: string): Promise<{
    chargingPrice: number;
    parkingFee: number;
    totalPrice: number;
    accountId: string;
  }> {
    const reservation = await this.reservationRepo.findOne({
      where: { id: reservationId },
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    // update reservation status
    await this.reservationRepo.update(reservationId, {
      status: ReservationStatus.COMPLETED,
    });
    // get start charging time from redis
    const startChargingTime = await this.redisService.get(
      `StartCharging:${reservationId}`,
    );
    if (!startChargingTime) {
      throw new NotFoundException('Start charging time not found');
    }
    // calculate charging time
    const chargingTime =
      (new Date().getTime() - new Date(startChargingTime).getTime()) /
      (1000 * 60 * 60);
    // total price
    const { chargingPrice, parkingFee, totalPrice } =
      await this.calChargingTimeAndPrice(reservationId, chargingTime);
    // remove reservation from redis
    await this.redisService.del(`StartCharging:${reservationId}`);
    return {
      chargingPrice,
      parkingFee,
      totalPrice,
      accountId: reservation.account_id,
    };
  }
}
