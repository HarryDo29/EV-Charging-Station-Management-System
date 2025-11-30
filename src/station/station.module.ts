import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationController } from './station.controller';
import { StationService } from './station.service';
import { StationEntity } from './entity/station.entity';
import { ChargePointEntity } from './entity/charge_point.entity';
import { ChargePointService } from './charge_point.service';
import { ReservationEntity } from './entity/reservation.entity';
import { ChargingSessionEntity } from './entity/charging_session.entity';
import { MailService } from 'src/mail/mail.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from 'src/redis/redis.module';
import { TransactionEntity } from 'src/transaction/entity/transaction.entity';
import { AccountService } from 'src/account/account.service';
import { AccountEntity } from 'src/account/entity/account.entity';
import { Argon2Service } from 'src/argon2/argon2.service';
import { ReservationService } from './reservation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StationEntity,
      ChargePointEntity,
      ReservationEntity,
      ChargingSessionEntity,
      TransactionEntity,
      AccountEntity,
    ]),
    RedisModule,
    ConfigModule,
  ],
  controllers: [StationController],
  providers: [
    StationService,
    ChargePointService,
    ReservationService,
    MailService,
    TransactionService,
    AccountService,
    Argon2Service,
  ],
  exports: [StationService, ChargePointService],
})
export class StationModule {}
