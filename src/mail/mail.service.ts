import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ReservationEntity } from 'src/station/entity/reservation.entity';
import { TransactionEntity } from 'src/transaction/entity/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StationEntity } from 'src/station/entity/station.entity';
import { join } from 'path';
import * as fs from 'fs-extra';
import handlebars from 'handlebars';
import { Logger } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import { parse, addMinutes } from 'date-fns';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private templatesDir = join(__dirname, 'template');

  constructor(
    private mailerService: MailerService,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(StationEntity)
    private readonly stationRepository: Repository<StationEntity>,
  ) {}

  async onModuleInit() {
    // debug verify transporter (thử connect SMTP khi app khởi động)
    try {
      const transporter = (
        this.mailerService as unknown as {
          transporter: Transporter;
        }
      ).transporter;
      if (transporter && typeof transporter.verify === 'function') {
        await transporter.verify();
        this.logger.log('SMTP verified successfully (Gmail).');
      } else {
        this.logger.warn('No transporter.verify() available.');
      }
    } catch (err) {
      this.logger.error('SMTP verify failed', err);
    }

    // register partials if exist
    const partialsDir = join(this.templatesDir, 'partials');
    if (fs.pathExistsSync(partialsDir)) {
      const files = fs.readdirSync(partialsDir);
      for (const f of files) {
        const name = f.replace(/\.(hbs|html)$/, '');
        const content = fs.readFileSync(join(partialsDir, f), 'utf8');
        handlebars.registerPartial(name, content);
      }
    }
  }

  private async compileTemplateFromHtml(templateName: string, context: any) {
    // templateName WITHOUT extension, ví dụ 'payment-success' -> file payment-success.html
    const templatePath = join(this.templatesDir, `${templateName}.html`);
    const exists = await fs.pathExists(templatePath);
    if (!exists) {
      throw new Error(`Template file not found: ${templatePath}`);
    }

    const templateStr = await fs.readFile(templatePath, 'utf8');
    const compiled = handlebars.compile(templateStr);
    return compiled(context);
  }

  // send otp verification email
  async sendOtpVerification(to: string, otpCode: string) {
    const htmlContent = await this.compileTemplateFromHtml(
      'otp_verification_email',
      {
        otpCode,
        year: new Date().getFullYear(),
      },
    );
    await this.mailerService.sendMail({
      to,
      subject: 'OTP Verification - EV Charger',
      html: htmlContent,
    });
  }

  // send payment success email
  async sendPaymentSuccess(to: string, transaction: TransactionEntity) {
    const { order_code, updated_at, amount } = transaction;
    const { start_time, end_time } = transaction.order.items[0].reservation;
    const stationName =
      transaction.order.items[0].reservation.charge_point.station.name;
    const htmlContent = await this.compileTemplateFromHtml(
      'payment_success_notification',
      {
        orderCode: order_code,
        dateTime: updated_at.toLocaleString(),
        amount: amount,
        chargePointId: stationName,
        startTime: start_time.toLocaleString(),
        endTime: end_time.toLocaleString(),
        year: new Date().getFullYear(),
      },
    );
    await this.mailerService.sendMail({
      to,
      subject: 'Payment Success - EV Charger',
      html: htmlContent,
    });
  }

  // send payment failed email
  async sendPaymentFailed(to: string, transaction: TransactionEntity) {
    const { order_code, updated_at, amount } = transaction;
    const { start_time, end_time } = transaction.order.items[0].reservation;
    const stationName =
      transaction.order.items[0].reservation.charge_point.station.name;
    const htmlContent = await this.compileTemplateFromHtml(
      'payment_failure_notification',
      {
        orderCode: order_code,
        dateTime: updated_at.toLocaleString(),
        amount: amount,
        chargePointId: stationName,
        startTime: start_time.toLocaleString(),
        endTime: end_time.toLocaleString(),
        year: new Date().getFullYear(),
      },
    );
    await this.mailerService.sendMail({
      to,
      subject: 'Payment Failed - EV Charger',
      html: htmlContent,
    });
  }

  // send reminder email
  async sendReminderEmail(to: string, reservation: ReservationEntity) {
    const { reservation_day, start_time, end_time, charge_point, created_at } =
      reservation;
    const stationName = await this.stationRepository.findOne({
      where: {
        id: charge_point.station.id,
      },
    });
    if (!stationName) {
      throw new NotFoundException('Station not found');
    }
    const htmlContent = await this.compileTemplateFromHtml(
      'late_reservation_notification',
      {
        driverName: reservation.account.full_name,
        reservationDay: reservation_day,
        startTime: start_time.toLocaleString(),
        endTime: end_time.toLocaleString(),
        scheduledTime: created_at.toLocaleString(),
        stationName: stationName.identifier,
        lateTime: start_time,
        year: new Date().getFullYear(),
      },
    );
    await this.mailerService.sendMail({
      to,
      subject: 'Reminder - EV Charger',
      html: htmlContent,
    });
  }

  // send notification email to cancel reservation
  async sendCancellationMail(to: string, reservation: ReservationEntity) {
    const { reservation_day, start_time, end_time, charge_point } = reservation;
    const stationName = await this.stationRepository.findOne({
      where: {
        id: charge_point.station.id,
      },
    });
    if (!stationName) {
      throw new NotFoundException('Station not found');
    }
    const htmlContent = await this.compileTemplateFromHtml(
      'reservation_cancellation_notification',
      {
        driverName: reservation.account.full_name,
        reservationDay: reservation_day,
        startTime: start_time.toLocaleString(),
        endTime: end_time.toLocaleString(),
        stationName: stationName.identifier,
        cancellationTime: parse(
          start_time,
          'HH:mm',
          addMinutes(new Date(), 30),
        ).toLocaleString(),
        year: new Date().getFullYear(),
      },
    );
    await this.mailerService.sendMail({
      to,
      subject: 'Notification - EV Charger',
      html: htmlContent,
    });
  }
}
