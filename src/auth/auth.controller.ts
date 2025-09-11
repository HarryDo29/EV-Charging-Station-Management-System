import { Controller, Post, Body, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() email: string,
    @Body() password: string,
    @Body() full_name: string,
  ) {
    return this.authService.registerByEmail(email, password, full_name);
  }

  @Post('login')
  async login(@Body() email: string, @Body() password: string) {
    return this.authService.loginByEmail(email, password);
  }

  @Post('send-passcode')
  async sendPasscode(@Headers('authorization') token: string) {
    const account = await this.authService.validateAccessToken(token);
    return this.authService.sendPasscode(account);
  }

  @Post('validate-email')
  async validateEmail(@Body() passcode: string, @Body() id: string) {
    return this.authService.validateEmail(passcode, id);
  }
}
