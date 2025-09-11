import { Injectable } from '@nestjs/common';
import { RefreshTokenEntity } from './entity/refreshToken.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async createRefreshToken(
    account_id: string,
    refresh_token: string,
  ): Promise<void> {
    const refreshToken = this.refreshTokenRepository.create({
      account_id: account_id,
      token: refresh_token,
    });
    await this.refreshTokenRepository.save(refreshToken);
  }

  async updateRefreshToken(
    account_id: string,
    refresh_token: string,
  ): Promise<void> {
    await this.refreshTokenRepository.update(
      { account_id: account_id },
      { token: refresh_token },
    );
  }
}
