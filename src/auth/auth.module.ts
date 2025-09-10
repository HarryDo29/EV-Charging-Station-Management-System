import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccountModule } from 'src/account/account.module';
import { Argon2Module } from 'src/argon2/argon2.module';

@Module({
  imports: [AccountModule, Argon2Module],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
