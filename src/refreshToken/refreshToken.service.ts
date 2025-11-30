import { Injectable, NotFoundException } from '@nestjs/common';
import { RefreshTokenEntity } from './entity/refreshToken.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtCustomService } from 'src/jwt/jwt.service';
import { AccountService } from 'src/account/account.service';
import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    private readonly jwtService: JwtCustomService,
    private readonly accountService: AccountService,
    private readonly redisService: RedisService,
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

  async refreshAccessToken(user: AuthenticatedUserDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const account = await this.accountService.findAccountById(user.id);
    if (!account) {
      throw new NotFoundException('User not found');
    }
    const newAccessToken = this.jwtService.sign({
      id: account.id,
      name: account.full_name,
      role: account.role,
    });
    const newRefreshToken = this.jwtService.signRefreshToken(
      {
        id: account.id,
        name: account.full_name,
        role: account.role,
      },
      {
        expiresIn: (user.exp! - Date.now()) * 1000,
      },
    );
    // set access token to redis
    await Promise.all([
      this.redisService.set(`id:${account.id}`, newAccessToken, 15 * 60 * 60), // 15 minutes
      this.updateRefreshToken(account.id, newRefreshToken),
    ]);
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
