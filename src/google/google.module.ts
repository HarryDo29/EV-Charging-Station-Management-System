import { Module } from '@nestjs/common';
import { GoogleController } from './google.controller';
import { PassportModule } from '@nestjs/passport';
import { OAuth2Strategy } from './strategy/oauth2.strategy';
import { AuthService } from 'src/auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from 'src/account/entity/account.entity';
import { AccountService } from 'src/account/account.service';
import { AccountModule } from 'src/account/account.module';
import { Argon2Module } from 'src/argon2/argon2.module';
import { JwtModule } from 'src/jwt/jwt.module';
import { RedisModule } from 'src/redis/redis.module';
import { RefreshTokenModule } from 'src/refreshToken/refreshToken.module';
import { MailService } from 'src/mail/mail.service';
import { RefreshTokenEntity } from 'src/refreshToken/entity/refreshToken.entity';
import { TransactionEntity } from 'src/transaction/entity/transaction.entity';
import { StationEntity } from 'src/station/entity/station.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    // PassportModule default strategy is oauth2
    PassportModule.register({ defaultStrategy: 'oauth2' }),
    TypeOrmModule.forFeature([
      AccountEntity,
      RefreshTokenEntity,
      TransactionEntity,
      StationEntity,
    ]),
    AccountModule,
    Argon2Module,
    JwtModule,
    RedisModule,
    RefreshTokenModule,
    MailModule,
  ],
  providers: [OAuth2Strategy, AuthService, AccountService, MailService],
  controllers: [GoogleController],
  exports: [],
})
export class GoogleModule {}
