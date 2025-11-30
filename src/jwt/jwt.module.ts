import { Global, Module } from '@nestjs/common';
import { JwtCustomService } from './jwt.service';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    NestJwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY_ACCESS_TOKEN'),
        // Đọc secret key từ .env
        signOptions: {
          expiresIn: configService.get<string>('EXPIRED_IN_ACCESS_TOKEN'),
          // Thời gian sống
        },
      }),
    }),
  ],
  providers: [JwtCustomService],
  exports: [JwtCustomService],
})
export class JwtModule {}
