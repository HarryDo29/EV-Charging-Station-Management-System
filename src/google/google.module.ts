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

@Module({
  imports: [
    // PassportModule default strategy is oauth2
    PassportModule.register({ defaultStrategy: 'oauth2' }),
    TypeOrmModule.forFeature([AccountEntity]),
    AccountModule,
    Argon2Module,
    JwtModule,
    RedisModule,
    RefreshTokenModule,
  ],
  providers: [OAuth2Strategy, AuthService, AccountService],
  controllers: [GoogleController],
  exports: [],
})
export class GoogleModule {}
