import { Injectable, NotFoundException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ReservationEntity } from 'src/station/entity/reservation.entity';
import { TransactionEntity } from 'src/transaction/entity/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StationEntity } from 'src/station/entity/station.entity';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(StationEntity)
    private readonly stationRepository: Repository<StationEntity>,
  ) {}

  // send otp verification email
  async sendOtpVerification(to: string, otpCode: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'OTP Verification - EV Charger',
      template: './otp_verification_email',
      context: {
        otpCode,
        year: new Date().getFullYear(),
      },
    });
  }

  // send booking confirmation email
  async sendBookingConfirmation(to: string, reservation: ReservationEntity) {
    const { charge_point_id, start_time, end_time } = reservation;
    await this.mailerService.sendMail({
      to,
      subject: 'Booking Reservation Confirmation - EV Charger',
      template: './reservation-template', // name file template
      context: {
        userName: reservation.account.full_name,
        chargePointId: charge_point_id,
        startTime: start_time.toLocaleString(),
        endTime: end_time.toLocaleString(),
        year: new Date().getFullYear(),
      },
    });
  }

  // send payment success email
  async sendPaymentSuccess(to: string, transaction: TransactionEntity) {
    const { identifier } = transaction.charge_point;
    const { start_time, end_time } = transaction.reservation;
    await this.mailerService.sendMail({
      to,
      subject: 'Payment Success - EV Charger',
      template: './payment_success_notification',
      context: {
        orderCode: transaction.order_code,
        dateTime: transaction.updated_at.toLocaleString(),
        amount: transaction.amount,
        chargePointId: identifier,
        startTime: start_time.toLocaleString(),
        endTime: end_time.toLocaleString(),
        year: new Date().getFullYear(),
      },
    });
  }

  // send payment failed email
  async sendPaymentFailed(to: string, transaction: TransactionEntity) {
    const { identifier } = transaction.charge_point;
    const { start_time, end_time } = transaction.reservation;
    await this.mailerService.sendMail({
      to,
      subject: 'Payment Failed - EV Charger',
      template: './payment_failure_notification',
      context: {
        orderCode: transaction.order_code,
        dateTime: transaction.updated_at.toLocaleString(),
        amount: transaction.amount,
        chargePointId: identifier,
        startTime: start_time.toLocaleString(),
        endTime: end_time.toLocaleString(),
        year: new Date().getFullYear(),
      },
    });
  }

  // send reminder email
  async sendReminderEmail(to: string, reservation: ReservationEntity) {
    const { reservation_day, start_time, end_time, charge_point, created_at } =
      reservation;
    const stationName = await this.stationRepository.findOne({
      where: {
        id: charge_point.station_id,
      },
    });
    if (!stationName) {
      throw new NotFoundException('Station not found');
    }
    await this.mailerService.sendMail({
      to,
      subject: 'Reminder - EV Charger',
      template: './late_reservation_notification',
      context: {
        driverName: reservation.account.full_name,
        reservationDay: reservation_day,
        startTime: start_time.toLocaleString(),
        endTime: end_time.toLocaleString(),
        scheduledTime: created_at.toLocaleString(),
        stationName: stationName.identifier,
        lateTime: (start_time.getTime() + 30 * 60 * 1000).toLocaleString(),
        year: new Date().getFullYear(),
      },
    });
  }

  // send notification email to cancel reservation
  async sendCancellationMail(to: string, reservation: ReservationEntity) {
    const { reservation_day, start_time, end_time, charge_point } = reservation;
    const stationName = await this.stationRepository.findOne({
      where: {
        id: charge_point.station_id,
      },
    });
    if (!stationName) {
      throw new NotFoundException('Station not found');
    }
    await this.mailerService.sendMail({
      to,
      subject: 'Notification - EV Charger',
      template: './reservation_cancellation_notification',
      context: {
        driverName: reservation.account.full_name,
        reservationDay: reservation_day,
        startTime: start_time.toLocaleString(),
        endTime: end_time.toLocaleString(),
        stationName: stationName.identifier,
        year: new Date().getFullYear(),
        cancellationTime: (
          start_time.getTime() +
          30 * 60 * 1000
        ).toLocaleString(),
      },
    });
  }
}
