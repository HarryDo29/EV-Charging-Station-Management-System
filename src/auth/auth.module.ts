import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccountModule } from 'src/account/account.module';
import { Argon2Module } from 'src/argon2/argon2.module';
import { JwtModule } from 'src/jwt/jwt.module';
import { RedisModule } from 'src/redis/redis.module';
import { RefreshTokenModule } from 'src/refreshToken/refreshToken.module';
import { MailModule } from 'src/mail/mail.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RoleGaurd } from './gaurd/role.gaurd';
import { RefreshTokenStrategy } from 'src/auth/strategy/jwt-refresh.strategy';

@Module({
  imports: [
    AccountModule,
    Argon2Module,
    JwtModule,
    RedisModule,
    RefreshTokenModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RoleGaurd, RefreshTokenStrategy],
  exports: [AuthService, JwtStrategy, RoleGaurd],
})
export class AuthModule {}
