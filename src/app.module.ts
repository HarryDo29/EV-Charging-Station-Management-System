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
import { RoleGaurd } from './auth/gaurd/role.gaurd';
import { VehicleModule } from './vehicle/vehicle.module';
import { PaymentModule } from './payment/payment.module';
import { TransactionModule } from './transaction/transaction.module';
import { PlanModule } from './plan/plan.module';

@Module({
  imports: [
    // Config for .env
    ConfigModule.forRoot({
      isGlobal: true,
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
    RedisModule,
    AuthModule,
    AccountModule,
    VehicleModule,
    PaymentModule,
    TransactionModule,
    PlanModule,
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
      useClass: RoleGaurd,
    },
  ],
})
export class AppModule {}
