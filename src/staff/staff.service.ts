import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { StaffEntity } from './entity/staff.entity';
import { ChargePointEntity } from 'src/station/entity/charge_point.entity';
import { ReservationStatus } from 'src/enums/reservation.enum';
import { ReservationEntity } from 'src/station/entity/reservation.entity';
import { RedisService } from 'src/redis/redis.service';
import { ChargePointService } from 'src/station/charge_point.service';
import { CreateStaffDto } from './dto/staff/createStaff.dto';
import { AccountEntity } from 'src/account/entity/account.entity';
import { Argon2Service } from 'src/argon2/argon2.service';
import { StationEntity } from 'src/station/entity/station.entity';

@Injectable()
export class StaffService {
  constructor(
    private readonly staffRepo: Repository<StaffEntity>,
    private readonly chargePointRepo: Repository<ChargePointEntity>,
    private readonly reservationRepo: Repository<ReservationEntity>,
    private readonly redisService: RedisService,
    private readonly chargePointService: ChargePointService,
    private readonly accountRepo: Repository<AccountEntity>,
    private readonly argon2Service: Argon2Service,
    private readonly stationRepo: Repository<StationEntity>,
  ) {}

  // create staff (create new account, create new staff, link account to staff)
  async createStaff(staff: CreateStaffDto): Promise<StaffEntity> {
    const { full_name, email, phone_number, password, role, station_id } =
      staff;
    // check if email is already in use
    const existingStaff = await this.accountRepo.findOne({
      where: { email: email, phone_number: phone_number },
    });
    if (existingStaff) {
      throw new BadRequestException('Email or phone number already in use');
    }
    // hash_password
    const hashedPassword = await this.argon2Service.hash(password);
    // create account
    const nAccount = this.accountRepo.create({
      full_name: full_name,
      email: email,
      phone_number: phone_number,
      password_hash: hashedPassword,
      role: role,
    });
    await this.accountRepo.save(nAccount);
    // find station
    const station = await this.stationRepo.findOne({
      where: { id: station_id },
    });
    if (!station) {
      throw new NotFoundException('Station not found');
    }
    // create staff
    const nStaff = this.staffRepo.create({
      account: nAccount,
      station: station,
      station_id: station_id,
    });
    return await this.staffRepo.save(nStaff);
  }

  // get all charge points in station by staff(account_id)
  async getChargePointsInStation(
    accountId: string,
  ): Promise<ChargePointEntity[]> {
    const staff = await this.staffRepo.findOne({
      where: { account_id: accountId },
      relations: ['station'],
    });
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    return await this.chargePointRepo.find({
      where: { station_id: staff.station.id },
    });
  }

  // check duplicated reservation by staff
  async checkDupReservation(
    chargePointId: string,
    start_time: Date,
  ): Promise<boolean> {
    const reservation = await this.reservationRepo.find({
      where: {
        charge_point_id: chargePointId,
        reservation_day: start_time.toISOString().split('T')[0], // format: YYYY-MM-DD
        status: ReservationStatus.PENDING,
      },
    });

    for (const res of reservation) {
      if (res.start_time <= start_time && res.end_time >= start_time) {
        // check start time - if start_time is in range of start_time and end_time in another reservation return false
        return false;
      }
    }

    return true;
  }

  // start charge point with staff role
  async startChargePoint(
    chargePointId: string,
    start_time: Date,
  ): Promise<void> {
    // check duplicated reservation
    const isDuplicated = await this.checkDupReservation(
      chargePointId,
      start_time,
    );
    if (isDuplicated) {
      throw new BadRequestException('Reservation is duplicated');
    }
    // create reservation
    const reservation = this.reservationRepo.create({
      reservation_day: start_time.toISOString().split('T')[0], // format: YYYY-MM-DD
      start_time: start_time,
      charge_point_id: chargePointId,
      status: ReservationStatus.RESERVED,
    });
    await Promise.all([
      this.reservationRepo.save(reservation),
      this.redisService.set(
        `StartCharging:${reservation.id}`,
        start_time.toISOString(),
      ),
    ]);
  }

  // end charge point with staff role
  async endChargePoint(
    chargePointId: string,
    end_time: Date,
  ): Promise<{
    chargingPrice: number;
    parkingFee: number;
    totalPrice: number;
  }> {
    const reservation = await this.reservationRepo.findOne({
      where: {
        charge_point_id: chargePointId,
        status: ReservationStatus.RESERVED,
      },
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
      (new Date().getTime() - new Date(startChargingTime).getTime()) /
      (1000 * 60 * 60);
    // total price
    const { chargingPrice, parkingFee, totalPrice } =
      await this.chargePointService.calChargingTimeAndPrice(
        reservation.id,
        chargingTime,
      );
    // remove reservation from redis
    // update reservation
    await Promise.all([
      this.reservationRepo.update(reservation.id, {
        end_time: end_time,
        status: ReservationStatus.COMPLETED,
        total_time: chargingTime,
      }),
      this.redisService.del(`StartCharging:${reservation.id}`),
    ]);
    return { chargingPrice, parkingFee, totalPrice };
  }
}
