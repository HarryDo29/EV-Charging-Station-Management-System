import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ReservationEntity } from 'src/station/entity/reservation.entity';
import { TransactionEntity } from 'src/transaction/entity/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
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
}
