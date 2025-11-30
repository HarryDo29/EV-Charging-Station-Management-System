import { Controller, Get, Req, Response, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type {
  Request as RequestExpress,
  Response as ResponseExpress,
} from 'express';
import { AuthService } from 'src/auth/auth.service';
import { UserResponseDto } from 'src/account/dto/userResponse.dto';

@Controller('google')
export class GoogleController {
  constructor(private readonly authService: AuthService) {}

  @Get('/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect() {
    // Start the authentication process, Passport will handle the rest
  }

  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: RequestExpress,
    @Response() response: ResponseExpress,
  ): Promise<void> {
    const user: UserResponseDto = req.user as UserResponseDto; // User validated from strategy
    const { accessToken, refreshToken } =
      await this.authService.loginByOAuth2(user);
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    });
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    response.redirect('http://localhost:5173/');
  }
}
