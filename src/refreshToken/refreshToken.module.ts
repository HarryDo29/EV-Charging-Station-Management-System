import { Module } from '@nestjs/common';
import { RefreshTokenService } from './refreshToken.service';

@Module({
  imports: [],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
