// src/jwt/jwt.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

@Injectable()
export class JwtCustomService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.rfTokenOptions = {
      secret: this.configService.get<string>('SECRET_KEY_REFRESH_TOKEN'),
      expiresIn: this.configService.get<string>('EXPIRED_IN_REFRESH_TOKEN'),
    };
  }
  private rfTokenOptions: JwtSignOptions;

  // Hàm tạo access token (mặc định là kí cho access token)
  sign(payload: object, options?: JwtSignOptions): string {
    return this.jwtService.sign(payload, options);
  }

  // Hàm xác thực token (mặc định là xác thực cho access token)
  verify(token: string, options?: JwtVerifyOptions): object {
    return this.jwtService.verify(token, options);
  }

  // Hàm kí refresh token
  signRefreshToken(payload: object): string {
    return this.jwtService.sign(payload, this.rfTokenOptions);
  }

  // Hàm xác thực refresh token
  verifyRefreshToken(token: string): object {
    return this.jwtService.verify(token, this.rfTokenOptions);
  }
}
