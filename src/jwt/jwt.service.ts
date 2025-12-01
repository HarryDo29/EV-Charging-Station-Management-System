// src/jwt/jwt.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

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
    this.emailTokenOptions = {
      secret: this.configService.get<string>('SECRET_KEY_EMAIL_VERIFIED'),
      expiresIn: this.configService.get<string>('EXPIRED_IN_EMAIL_VERIFIED'),
    };
  }
  private rfTokenOptions: JwtSignOptions;
  private emailTokenOptions: JwtSignOptions;

  // Hàm tạo access token (mặc định là kí cho access token)
  sign(payload: object): string {
    return this.jwtService.sign(payload);
  }

  // Hàm xác thực token (mặc định là xác thực cho access token)
  verify(token: string): object {
    return this.jwtService.verify(token);
  }

  // Hàm kí refresh token
  signRefreshToken(payload: object): string {
    return this.jwtService.sign(payload, {
      ...this.rfTokenOptions,
    });
  }

  // Hàm xác thực refresh token
  verifyRefreshToken(token: string): object {
    return this.jwtService.verify(token, this.rfTokenOptions);
  }

  // Hàm kí email token
  signEmailToken(payload: object): string {
    return this.jwtService.sign(payload, this.emailTokenOptions);
  }

  // Hàm xác thực email token
  verifyEmailToken(token: string): object {
    console.log('emailTokenOptions', this.emailTokenOptions);
    return this.jwtService.verify(token, this.emailTokenOptions);
  }
}
