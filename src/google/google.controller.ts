import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { AccountEntity } from 'src/account/entity/account.entity';
import { UserResponseDto } from 'src/account/dto/userResponse.dto';

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
  async googleAuthCallback(@Req() req: Request): Promise<UserResponseDto> {
    const user: AccountEntity = req.user as AccountEntity; // User đã được validate từ strategy
    const userResponse = await this.authService.loginByOAuth2(user);
    // Tạo session hoặc JWT nếu cần
    return userResponse; // Chuyển hướng sau khi xác thực
  }
}
