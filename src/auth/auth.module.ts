import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Argon2Module } from 'src/argon2/argon2.module';
import { JwtModule } from 'src/jwt/jwt.module';
import { RedisModule } from 'src/redis/redis.module';
import { RefreshTokenModule } from 'src/refreshToken/refreshToken.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RoleGuard } from './guard/role.guard';
import { RefreshTokenStrategy } from 'src/auth/strategy/jwt-refresh.strategy';
import { MailService } from 'src/mail/mail.service';
import { AccountEntity } from 'src/account/entity/account.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenEntity } from 'src/refreshToken/entity/refreshToken.entity';
import { TransactionEntity } from 'src/transaction/entity/transaction.entity';
import { StationEntity } from 'src/station/entity/station.entity';
import { GoogleModule } from 'src/google/google.module';
import { MailModule } from 'src/mail/mail.module';
import { AccountService } from 'src/account/account.service';
import { JwtCustomService } from 'src/jwt/jwt.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountEntity,
      RefreshTokenEntity,
      TransactionEntity,
      StationEntity,
    ]),
    Argon2Module,
    JwtModule,
    RedisModule,
    RefreshTokenModule,
    GoogleModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RoleGuard,
    RefreshTokenStrategy,
    MailService,
    AccountService,
    JwtCustomService,
    JwtService,
  ],
  exports: [AuthService, JwtStrategy, RoleGuard],
})
export class AuthModule {}
