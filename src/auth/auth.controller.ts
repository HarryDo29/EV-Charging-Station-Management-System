import { Controller, Post, Body, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new account' })
  @ApiResponse({ status: 201, description: 'Register a new account' })
  @ApiResponse({ status: 400, description: 'Account already exists' })
  @Post('register')
  async register(
    @Body() email: string,
    @Body() password: string,
    @Body() full_name: string,
  ) {
    return this.authService.registerByEmail(email, password, full_name);
  }

  @ApiOperation({ summary: 'Login an account' })
  @ApiResponse({ status: 200, description: 'Login an account' })
  @ApiResponse({ status: 400, description: 'Invalid email or password' })
  @Post('login')
  async login(@Body() email: string, @Body() password: string) {
    return this.authService.loginByEmail(email, password);
  }

  @ApiOperation({ summary: 'Send passcode to email' })
  @Post('send-passcode')
  async sendPasscode(@Headers('authorization') token: string) {
    const account = await this.authService.validateAccessToken(token);
    return this.authService.sendPasscode(account);
  }

  @ApiOperation({ summary: 'Validate email' })
  @Post('validate-email')
  async validateEmail(@Body() passcode: string, @Body() id: string) {
    return this.authService.validateEmail(passcode, id);
  }
}
