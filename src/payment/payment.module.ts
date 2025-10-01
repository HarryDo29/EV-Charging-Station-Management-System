import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { EventsGateway } from 'src/event/event.gateway';
import { TransactionEntity } from 'src/transaction/entity/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity])],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: 'PAYOS_INSTANCE',
      useFactory: (configService: ConfigService) => {
        const clientId = configService.get<string>('PAYOS_CLIENT_ID');
        const apiKey = configService.get<string>('PAYOS_API_KEY');
        const checksumKey = configService.get<string>('PAYOS_CHECKSUM_KEY');

        // Validate required PayOS credentials
        if (!clientId || !apiKey || !checksumKey) {
          throw new Error(
            'PayOS credentials are missing. Please set PAYOS_CLIENT_ID, PAYOS_API_KEY, and PAYOS_CHECKSUM_KEY in your environment variables.',
          );
        }

        const payosInstance = new PayOS({
          clientId,
          apiKey,
          checksumKey,
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
