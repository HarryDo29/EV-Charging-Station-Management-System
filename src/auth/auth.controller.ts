import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Response,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/registerAccount.dto';
import { LoginDto } from './dto/loginAccount.dto';
import { AuthGuard } from '@nestjs/passport';
import { AccountService } from 'src/account/account.service';
import { RefreshTokenService } from 'src/refreshToken/refreshToken.service';
import { AuthenticatedUserDto } from './dto/authenticated-user.dto';
import type {
  Request as RequestExpress,
  Response as ResponseExpress,
} from 'express';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { UserResponseDto } from 'src/account/dto/userResponse.dto';
import { RefreshTokenGuard } from 'src/auth/gaurd/rfToken.gaurd';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  @Post('/register')
  async register(
    @Body() registerDto: RegisterDto,
    @Response({ passthrough: true }) response: ResponseExpress,
  ): Promise<UserResponseDto> {
    const { userResponse, accessToken, refreshToken } =
      await this.authService.registerByEmail(registerDto);
    response.cookie('accessToken', accessToken, {
      httpOnly: true, // Bắt buộc
      // secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 phút
    });
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Bắt buộc
      // secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
    });
    return userResponse;
  }

  @Post('/login')
  async loginByEmail(
    @Body() loginDto: LoginDto,
    @Response({ passthrough: true }) response: ResponseExpress,
  ): Promise<UserResponseDto> {
    const { userResponse, accessToken, refreshToken } =
      await this.authService.loginByEmail(loginDto);
    response.cookie('accessToken', accessToken, {
      httpOnly: true, // Bắt buộc
      // secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 phút
    });
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Bắt buộc
      // secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
    });
    return userResponse;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/send-passcode')
  async sendPasscode(@Request() req: RequestExpress) {
    const acc = req.user as AuthenticatedUserDto;
    const account = await this.accountService.findAccountById(acc.id);
    return await this.authService.sendPasscode(account!);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/validate-email')
  async validateEmail(
    @Body() passcode: string,
    @Request() req: RequestExpress,
  ) {
    const acc = req.user as AuthenticatedUserDto;
    return await this.authService.validateEmail(passcode, acc.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: RequestExpress,
  ) {
    const acc = req.user as AuthenticatedUserDto;
    return await this.authService.changePassword(acc.id, changePasswordDto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('/refresh-access-token')
  async refreshAccessToken(
    @Request() req: RequestExpress,
    @Response({ passthrough: true }) response: ResponseExpress,
  ) {
    const acc = req.user as AuthenticatedUserDto;
    console.log('acc from refreshAccessToken', acc);
    const { accessToken, refreshToken } =
      await this.refreshTokenService.refreshAccessToken(acc);
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 phút
    });
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
    });
    return {
      message: 'Refresh access token successfully',
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/logout')
  async logout(
    @Request() req: RequestExpress,
    @Response({ passthrough: true }) response: ResponseExpress,
  ): Promise<{ message: string }> {
    const acc = req.user as AuthenticatedUserDto;
    const account = await this.accountService.findAccountById(acc.id);
    await this.authService.logout(account!);
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    return {
      message: 'Logged out successfully',
    };
  }
}
