import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ReservationEntity } from 'src/station/entity/reservation.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendBookingConfirmation(to: string, reservation: ReservationEntity) {
    const { charge_point_id, start_time, end_time } = reservation;

    await this.mailerService.sendMail({
      to,
      subject: 'Booking Reservation Confirmation - EV Charger',
      template: './reservation-template', // Tên file template
      context: {
        userName: reservation.account.full_name,
        chargePointId: charge_point_id,
        startTime: start_time.toLocaleString(),
        endTime: end_time.toLocaleString(),
      },
    });
  }
}
