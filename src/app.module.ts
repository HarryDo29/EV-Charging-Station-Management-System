import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import redisConfig from './config/redis.config';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './account/account.module';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { VehicleModule } from './vehicle/vehicle.module';
import { PaymentModule } from './payment/payment.module';
import { TransactionModule } from './transaction/transaction.module';
import { PlanModule } from './plan/plan.module';
import { GoogleModule } from './google/google.module';
import { CronModule } from './cron/cron.module';
import { BullModule } from '@nestjs/bullmq';
import { QueueOptions } from 'bullmq';
import { QueueModule } from './queue/queue.module';
import { R2StorageModule } from './r2Storage/r2Storage.module';
import { StationModule } from './station/station.module';
import { OrderModule } from './order/order.module';
import { CheckOutModule } from './checkOut/checkOut.module';
// import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    // Config for .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig, redisConfig],
    }),
    // Config for TypeOrm
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database')!,
      // Get all configurations with namespace 'database'
    }),
    // Config for BullMQ
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): QueueOptions => ({
        connection: {
          host: configService.get<string>('REDIS_HOST')!,
          port: parseInt(configService.get<string>('REDIS_PORT')!, 10),
          password: configService.get<string>('REDIS_PASSWORD')!,
        },
      }),
    }),
    RedisModule,
    AuthModule,
    AccountModule,
    VehicleModule,
    StationModule,
    PaymentModule,
    TransactionModule,
    PlanModule,
    GoogleModule,
    QueueModule,
    CronModule,
    R2StorageModule,
    OrderModule,
    CheckOutModule,
    // MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE, // Tell NestJS that this is a global pipe
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD, // Tell NestJS that this is a global guard
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
