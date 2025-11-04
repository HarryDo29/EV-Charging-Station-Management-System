import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TransactionEntity } from 'src/transaction/entity/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { AccountService } from 'src/account/account.service';
import { AccountEntity } from 'src/account/entity/account.entity';
import { Argon2Service } from 'src/argon2/argon2.service';
import { PaymentGateway } from './payment.gateway';
import { OrderEntity } from 'src/order/entity/order.entity';
import { StationEntity } from 'src/station/entity/station.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransactionEntity,
      StationEntity,
      AccountEntity,
      OrderEntity,
    ]),
  ],
  controllers: [PaymentController],
  providers: [
    MailService,
    PaymentService,
    PaymentGateway,
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
    TransactionService,
    AccountService,
    Argon2Service,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
