import { Module } from '@nestjs/common';
import { RefreshTokenService } from './refreshToken.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entity/refreshToken.entity';
import { AccountService } from 'src/account/account.service';
import { AccountEntity } from 'src/account/entity/account.entity';
import { Argon2Service } from 'src/argon2/argon2.service';
import { RedisModule } from 'src/redis/redis.module';
import { Argon2Module } from 'src/argon2/argon2.module';
import { JwtModule } from 'src/jwt/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshTokenEntity, AccountEntity]),
    RedisModule,
    Argon2Module,
    JwtModule,
  ],
  providers: [RefreshTokenService, AccountService, Argon2Service],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
