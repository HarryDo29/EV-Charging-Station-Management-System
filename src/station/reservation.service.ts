import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThanOrEqual, Repository } from 'typeorm';
import { ReservationEntity } from './entity/reservation.entity';
import { ReservationStatus } from 'src/enums/reservation.enum';
import { CreateReservationDto } from './dto/reservation/createReservation.dto';
import { StationStatus } from 'src/enums/stationStatus.enum';
import { ChargePointService } from './charge_point.service';
import { MailService } from 'src/mail/mail.service';
import { ChargePointEntity } from './entity/charge_point.entity';
import { parse } from 'date-fns';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(ReservationEntity)
    private readonly reservationRepo: Repository<ReservationEntity>,
    @InjectRepository(ChargePointEntity)
    private readonly chargePointRepo: Repository<ChargePointEntity>,
    private readonly chargePointService: ChargePointService,
    private readonly mailService: MailService,
  ) {}
  FIFTEEN_MINUTES = 15 * 60 * 1000;
  THIRTY_MINUTES = 30 * 60 * 1000;

  // check duplicated reservation
  async checkDuplicatedReservation(
    reservation_day: string,
    charge_point_id: string,
    start_time: string,
    end_time: string,
  ): Promise<boolean> {
    const baseDate = new Date();
    const startTime = parse(start_time, 'HH:mm', baseDate);
    const endTime = parse(end_time, 'HH:mm', baseDate);
    const reservation = await this.reservationRepo.find({
      where: {
        reservation_day: reservation_day,
        charge_point: { id: charge_point_id },
        status: ReservationStatus.PENDING,
      },
    });
    // check start time: if in range of start_time and end_time in another reservation
    // check end time: if in range of start_time and end_time in another reservation
    for (const res of reservation) {
      const resStartTime = parse(res.start_time, 'HH:mm', baseDate);
      const resEndTime = parse(res.end_time, 'HH:mm', baseDate);
      // check start time - if start_time is in range of start_time and end_time in another reservation return false
      if (resStartTime <= startTime || resEndTime >= startTime) {
        return true;
      }
      // check end time - if end_time is in range of start_time and end_time in another reservation return false
      if (resStartTime <= endTime || resEndTime >= endTime) {
        return true;
      }
    }
    return false;
  }

  // create reservation (only available and not reserved)
  async createReservation(
    accountId: string,
    reservation: CreateReservationDto,
  ) {
    console.log('reservation', reservation);

    const {
      reservation_day,
      charge_point_id,
      start_time,
      end_time,
      vehicle_id,
    } = reservation;
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
    if (isDuplicated === true) {
      throw new BadRequestException('Reservation is duplicated');
    }
    // create reservation
    const nReservation = this.reservationRepo.create({
      reservation_day: reservation_day,
      start_time: start_time,
      end_time: end_time,
      account: { id: accountId },
      charge_point: { id: charge_point_id },
      vehicle: { id: vehicle_id },
    });
    // send email to account
    // await this.mailService.sendBookingConfirmation(
    //   nReservation.account.email,
    //   nReservation,
    // );
    return await this.reservationRepo.save(nReservation);
  }

  // get reservation of week
  async getReservationOfWeek(
    chargePointId: string,
  ): Promise<ReservationEntity[]> {
    const now = new Date();
    console.log('now', now);

    // Tính ngày bắt đầu tuần (Chủ nhật)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startDateStr = startOfWeek.toISOString().split('T')[0]; // format: YYYY-MM-DD

    // Tính ngày kết thúc tuần (Thứ 7)
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
    const endDateStr = endOfWeek.toISOString().split('T')[0]; // format: YYYY-MM-DD

    // Lấy danh sách reservations trong tuần
    const reservations = await this.reservationRepo.find({
      where: {
        reservation_day: Between(startDateStr, endDateStr),
        charge_point: { id: chargePointId },
      },
      // relations: ['account', 'charge_point', 'vehicle'],
      order: {
        reservation_day: 'ASC',
        start_time: 'ASC',
      },
    });

    return reservations;
  }

  // get expired reservation at time now
  async getExpiredReservation(): Promise<{
    remindArray: ReservationEntity[];
    expiredArray: ReservationEntity[];
  }> {
    // get all reservation that status is pending and start time is more than now
    const expiredReservation = await this.reservationRepo.find({
      where: {
        status: ReservationStatus.PENDING,
        start_time: MoreThanOrEqual(new Date().toISOString()),
      },
    });
    // array of remind reservation
    const remindArray: ReservationEntity[] = [];
    // array of expired reservation
    const expiredArray: ReservationEntity[] = [];
    // filter remind and expired reservation
    for (const res of expiredReservation) {
      const now = new Date();
      const startTime = parse(res.start_time, 'HH:mm', now);
      const timeDiff = now.getTime() - startTime.getTime();
      // remind reservation
      if (timeDiff > this.FIFTEEN_MINUTES && timeDiff < this.THIRTY_MINUTES) {
        remindArray.push(res);
        // send email to account
        await this.mailService.sendReminderEmail(res.account.email, res);
      }
      // expired reservation
      if (timeDiff > this.THIRTY_MINUTES) {
        expiredArray.push(res);
        // update reservation status to expired
        await this.updateReserStatusToCancelled(res.id);
        // send email to account
        await this.mailService.sendCancellationMail(res.account.email, res);
      }
    }
    return {
      remindArray,
      expiredArray,
    };
  }

  // update reservation status to expired
  async updateReserStatusToCancelled(reservationId: string): Promise<void> {
    await this.reservationRepo.update(reservationId, {
      status: ReservationStatus.CANCELLED,
    });
  }
}
