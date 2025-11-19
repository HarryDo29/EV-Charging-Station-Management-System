import { Module } from '@nestjs/common';
import { CheckOutController } from './checkOut.controller';
import { ReservationService } from 'src/station/reservation.service';
import { OrderService } from 'src/order/order.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationEntity } from 'src/station/entity/reservation.entity';
import { OrderEntity } from 'src/order/entity/order.entity';
import { TransactionEntity } from 'src/transaction/entity/transaction.entity';
import { AccountEntity } from 'src/account/entity/account.entity';
import { ChargePointEntity } from 'src/station/entity/charge_point.entity';
import { ChargePointService } from 'src/station/charge_point.service';
import { MailService } from 'src/mail/mail.service';
import { OrderItemEntity } from 'src/order/entity/order_item.entity';
import { AccountService } from 'src/account/account.service';
import { StationEntity } from 'src/station/entity/station.entity';
import { ChargingSessionEntity } from 'src/station/entity/charging_session.entity';
import { Argon2Service } from 'src/argon2/argon2.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReservationEntity,
      OrderEntity,
      OrderItemEntity,
      TransactionEntity,
      AccountEntity,
      ChargePointEntity,
      StationEntity,
      ChargingSessionEntity,
    ]),
  ],
  controllers: [CheckOutController],
  providers: [
    ReservationService,
    OrderService,
    TransactionService,
    ChargePointService,
    MailService,
    TransactionService,
    AccountService,
    Argon2Service,
  ],
})
export class CheckOutModule {}
