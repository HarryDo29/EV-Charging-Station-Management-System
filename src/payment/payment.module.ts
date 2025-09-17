import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { EventsGateway } from 'src/event/event.gateway';

@Global()
@Module({
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: 'PAYOS_INSTANCE',
      useFactory: (configService: ConfigService) => {
        const payosInstance = new PayOS({
          clientId: configService.get<string>('PAYOS_CLIENT_ID'),
          apiKey: configService.get<string>('PAYOS_API_KEY'),
          checksumKey: configService.get<string>('PAYOS_CHECKSUM_KEY'),
        });
        return payosInstance;
      },
      inject: [ConfigService],
    },
    EventsGateway,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
