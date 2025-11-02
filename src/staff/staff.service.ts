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
import { ChargingSessionEntity } from 'src/station/entity/charging_session.entity';
import { SessionStatus } from 'src/enums/sessionStatus.enum';
import { parse } from 'date-fns';

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
    private readonly chargingSessionRepo: Repository<ChargingSessionEntity>,
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
    start_time: string,
  ): Promise<boolean> {
    const reservation = await this.reservationRepo.find({
      where: {
        charge_point: { id: chargePointId },
        reservation_day: new Date().toISOString().split('T')[0], // format: YYYY-MM-DD
        status: ReservationStatus.PENDING,
      },
    });
    const baseDate = new Date();
    const startTime = parse(start_time, 'HH:mm', baseDate);
    for (const res of reservation) {
      const resStartTime = parse(res.start_time, 'HH:mm', baseDate);
      const resEndTime = parse(res.end_time, 'HH:mm', baseDate);
      if (resStartTime <= startTime && resEndTime >= startTime) {
        // check start time - if start_time is in range of start_time and end_time in another reservation return false
        return false;
      }
    }

    return true;
  }

  // start charge point with staff role
  async startChargePoint(
    chargePointId: string,
    day: string,
    start_time: string,
  ): Promise<ChargingSessionEntity> {
    const chargePoint = await this.chargePointRepo.findOne({
      where: { id: chargePointId },
    });
    if (!chargePoint) {
      throw new NotFoundException('Charge point not found');
    }
    // check duplicated reservation
    const isDuplicated = await this.checkDupReservation(
      chargePointId,
      start_time,
    );
    if (isDuplicated) {
      throw new BadRequestException('Reservation is duplicated');
    }
    // create charging session
    const chargingSession = this.chargingSessionRepo.create({
      day: day,
      start_time: start_time,
      charge_point: chargePoint,
    });
    await this.chargingSessionRepo.save(chargingSession);
    await this.redisService.set(
      `StartChargingSession:${chargingSession.id}`,
      start_time,
    );
    return chargingSession;
  }

  // end charge point with staff role
  async endChargePoint(
    chargingSessionId: string,
    end_time: string,
  ): Promise<{
    chargingPrice: number;
    parkingFee: number;
    totalPrice: number;
  }> {
    // get charging session
    const chargingSession = await this.chargingSessionRepo.findOne({
      where: {
        id: chargingSessionId,
        status: SessionStatus.IN_PROGRESS,
      },
    });
    if (!chargingSession) {
      throw new NotFoundException('Reservation not found');
    }
    // get start charging time from redis
    const startChargingTime = await this.redisService.get(
      `StartChargingSession:${chargingSession.id}`,
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
      this.chargePointService.calChargingTimeAndPrice(
        chargingSession,
        chargingTime,
      );
    // remove start charging time from redis
    // update charging session
    await Promise.all([
      this.chargingSessionRepo.update(chargingSession.id, {
        end_time: end_time,
        status: SessionStatus.COMPLETED,
        total_time: chargingTime,
      }),
      this.redisService.del(`StartChargingSession:${chargingSession.id}`),
    ]);
    return { chargingPrice, parkingFee, totalPrice };
  }
}
