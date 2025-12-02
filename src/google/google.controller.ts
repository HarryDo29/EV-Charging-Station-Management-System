import { Controller, Get, Req, Response, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type {
  Request as RequestExpress,
  Response as ResponseExpress,
} from 'express';
import { AuthService } from 'src/auth/auth.service';
import { UserResponseDto } from 'src/account/dto/userResponse.dto';
import { ConfigService } from '@nestjs/config';

@ApiTags('Google OAuth2')
@Controller('google')
export class GoogleController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/redirect')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth2 authentication' })
  @ApiResponse({ status: 302, description: 'Redirect to Google login page' })
  async googleAuthRedirect() {
    // Start the authentication process, Passport will handle the rest
  }

  @Get('callback')
  @UseGuards(AuthGuard('google'))
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Google OAuth2 callback (handled by Passport)' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to frontend with authentication cookies',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async googleAuthCallback(
    @Req() req: RequestExpress,
    @Response() response: ResponseExpress,
  ): Promise<void> {
    const user: UserResponseDto = req.user as UserResponseDto; // User validated from strategy
    const { accessToken, refreshToken } =
      await this.authService.loginByOAuth2(user);
    console.log('accessToken', accessToken);
    console.log('refreshToken', refreshToken);
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.harydo.xyz',
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    });
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.harydo.xyz',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    response.redirect(this.configService.get<string>('FRONTEND_URL')!);
  }
}
