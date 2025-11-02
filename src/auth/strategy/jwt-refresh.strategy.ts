import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import type { Request as RequestExpress } from 'express';
import { ConfigService } from '@nestjs/config';
import { AccountService } from 'src/account/account.service'; // (Service user của bạn)
import { AuthenticatedUserDto } from '../dto/authenticated-user.dto';
import { Role } from 'src/enums/role.enum';

export interface JwtRefreshPayload {
  id: string;
  name: string;
  role: Role;
  exp: number;
}

// Hàm helper để trích xuất cookie từ request
const cookieExtractorRefreshToken = (req: RequestExpress): string | null => {
  let token: string | null = null;
  if (req && req.cookies && typeof req.cookies === 'object') {
    const cookie = req.cookies as Record<string, unknown>;
    token =
      typeof cookie['refreshToken'] === 'string'
        ? cookie['refreshToken']
        : null;
  }
  return token;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh', // Đặt tên riêng cho strategy này
) {
  constructor(
    configService: ConfigService,
    private accountService: AccountService,
  ) {
    super({
      // Dùng hàm extractor để lấy token từ cookie
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractorRefreshToken,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      // Quan trọng: KHÔNG bỏ qua hết hạn cho refresh token
      ignoreExpiration: false,
      // Dùng secret của REFRESH token
      secretOrKey: configService.get<string>('SECRET_KEY_REFRESH_TOKEN')!,
    });
  }

  // Hàm validate này CHỈ chạy khi refreshToken HỢP LỆ và CÒN HẠN
  async validate(payload: JwtRefreshPayload): Promise<AuthenticatedUserDto> {
    // (payload: { id: string, name: string, role: string, ... })

    // Kiểm tra xem user còn tồn tại không
    const account = await this.accountService.findAccountById(payload.id);
    if (!account) {
      throw new UnauthorizedException('Account not found');
    }

    // Trả về user payload, NestJS sẽ tự động gắn vào req.user
    return {
      id: payload.id,
      name: payload.name,
      role: payload.role,
      exp: payload.exp,
    };
  }
}
