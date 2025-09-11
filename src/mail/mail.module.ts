import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailService } from './mail.service';

@Global() // Giúp MailService có thể được inject ở bất kỳ đâu
@Module({
  providers: [
    MailService,
    {
      provide: 'MAIL_TRANSPORTER', // Tạo một provider với token tùy chỉnh
      useFactory: (configService: ConfigService) => {
        // Factory này sẽ tạo ra transporter của nodemailer
        const transporter = nodemailer.createTransport({
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          secure: configService.get<boolean>('MAIL_SECURE'), // true cho port 465, false cho các port khác
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        });
        return transporter;
      },
      inject: [ConfigService], // Inject ConfigService để đọc file .env
    },
  ],
  exports: [MailService], // Export MailService để các module khác có thể sử dụng
})
export class MailModule {}
