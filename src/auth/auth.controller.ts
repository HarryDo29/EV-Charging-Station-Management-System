import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/registerAccount.dto';
import { LoginDto } from './dto/loginAccount.dto';
import { AuthGuard } from '@nestjs/passport';
import { AccountService } from 'src/account/account.service';
import { AuthenticatedUserDto } from './dto/authenticated-user.dto';
import type { Request as RequestExpress } from 'express';
import { ChangePasswordDto } from './dto/changePassword.dto';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
  ) {}

  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.registerByEmail(registerDto);
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.loginByEmail(loginDto);
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
  @Post('/change-password/:id')
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(id, changePasswordDto);
  }
}
