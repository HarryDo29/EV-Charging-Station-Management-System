import { Injectable, Inject } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  // Inject transporter vào service bằng token 'MAIL_TRANSPORTER'
  constructor(
    @Inject('MAIL_TRANSPORTER')
    private readonly mailer: nodemailer.Transporter,
  ) {}

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.mailer.sendMail({
        from: process.env.MAIL_FROM, // Lấy địa chỉ người gửi từ .env
        to: to,
        subject: subject,
        html: html,
      });
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      // Bạn nên xử lý lỗi một cách phù hợp hơn ở đây
      throw new Error('Could not send email.');
    }
  }
}
