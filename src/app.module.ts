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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database')!,
      // Lấy toàn bộ cấu hình có namespace 'database'
    }),
    RedisModule,
    AuthModule,
    AccountModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE, // Báo cho NestJS rằng đây là một Pipe toàn cục
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD, // Báo cho NestJS rằng đây là một Guard toàn cục
      useClass: RoleGaurd,
    },
  ],
})
export class AppModule {}
