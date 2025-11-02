import { Controller, Get, Req, Response, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type {
  Request as RequestExpress,
  Response as ResponseExpress,
} from 'express';
import { AuthService } from 'src/auth/auth.service';
import { AccountEntity } from 'src/account/entity/account.entity';

@Controller('google')
export class GoogleController {
  constructor(private readonly authService: AuthService) {}

  @Get('/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect() {
    // Bắt đầu quá trình xác thực, Passport sẽ xử lý
  }

  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: RequestExpress,
    @Response() response: ResponseExpress,
  ): Promise<void> {
    const user: AccountEntity = req.user as AccountEntity; // User đã được validate từ strategy
    const { accessToken, refreshToken } =
      await this.authService.loginByOAuth2(user);
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 phút
    });
    console.log('save access token to cookie');
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
    });
    console.log('save refresh token to cookie');
    // Tạo session hoặc JWT nếu cần
    // Chuyển hướng sau khi xác thực
    response.redirect('http://localhost:5173/');
  }
}
