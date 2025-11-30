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
import { RefreshTokenGuard } from 'src/auth/guard/rfToken.guard';

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
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // sameSite: 'strict',
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    });
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // sameSite: 'strict',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
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
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // sameSite: 'strict',
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    });
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // sameSite: 'strict',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    return userResponse;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/send-passcode')
  async sendPasscode(@Request() req: RequestExpress) {
    const acc = req.user as AuthenticatedUserDto;
    const account = await this.accountService.findAccountById(acc.id);
    if (!account) {
      throw new Error('Account not found');
    }
    return await this.authService.sendPasscode(account);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/verify-email')
  async validateEmail(
    @Body() passcode: { otp: string },
    @Request() req: RequestExpress,
  ) {
    const acc = req.user as AuthenticatedUserDto;
    await this.authService.validateEmail(passcode.otp, acc.id);
    return {
      message: 'Email verified successfully',
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: RequestExpress,
  ) {
    const acc = req.user as AuthenticatedUserDto;
    await this.authService.changePassword(acc.id, changePasswordDto);
    return {
      message: 'Password changed successfully',
    };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('/refresh-access-token')
  async refreshAccessToken(
    @Request() req: RequestExpress,
    @Response({ passthrough: true }) response: ResponseExpress,
  ) {
    const acc = req.user as AuthenticatedUserDto;
    const { accessToken, refreshToken } =
      await this.refreshTokenService.refreshAccessToken(acc);
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // sameSite: 'strict',
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    });
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // sameSite: 'strict',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
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
    if (!account) {
      throw new Error('Account not found');
    }
    await this.authService.logout(account);
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    return {
      message: 'Logged out successfully',
    };
  }
}
