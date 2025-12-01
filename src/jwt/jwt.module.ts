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
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('SECRET_KEY_ACCESS_TOKEN');
        const expiresIn = configService.get<string>('EXPIRED_IN_ACCESS_TOKEN');
        if (!secret) {
          throw new Error(
            'SECRET_KEY_ACCESS_TOKEN is not defined in .env file. Please check your .env file.',
          );
        }
        return {
          secret,
          signOptions: {
            expiresIn: expiresIn || '60m',
          },
        };
      },
    }),
  ],
  providers: [JwtCustomService],
  exports: [JwtCustomService],
})
export class JwtModule {}
