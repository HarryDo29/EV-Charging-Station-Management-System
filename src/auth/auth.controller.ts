import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/registerAccount.dto';
import { LoginDto } from './dto/loginAccount.dto';
import { AuthGuard } from '@nestjs/passport';
import { AccountService } from 'src/account/account.service';
import { AuthenticatedUserDto } from './dto/authenticated-user.dto';
import type { Request as RequestExpress } from 'express';
// import { Request as RequestNest } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.registerByEmail(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.loginByEmail(loginDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('send-passcode')
  async sendPasscode(@Request() req: RequestExpress) {
    const acc = req.user as AuthenticatedUserDto;
    const account = await this.accountService.findAccountById(acc.id);
    return this.authService.sendPasscode(account);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('validate-email')
  async validateEmail(
    @Body() passcode: string,
    @Request() req: RequestExpress,
  ) {
    const acc = req.user as AuthenticatedUserDto;
    return this.authService.validateEmail(passcode, acc.id);
  }
}
