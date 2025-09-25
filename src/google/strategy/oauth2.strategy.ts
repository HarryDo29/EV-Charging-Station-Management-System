import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { OAuth2Dto } from 'src/auth/dto/oauth2.dto';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class OAuth2Strategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      authorizationURL: configService.get<string>(
        'GOOGLE_AUTHORIZATION_URL',
      ) as string,
      tokenURL: configService.get<string>('GOOGLE_TOKEN_URL') as string,
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') as string,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') as string,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') as string,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { name, emails } = profile;
    // console.log('profile');
    // console.log(profile);
    // console.log('accessToken');
    // console.log(accessToken);

    if (!emails) {
      throw new UnauthorizedException('No email found');
    }
    // Xử lý profile từ nhà cung cấp (Google)
    const user: OAuth2Dto = {
      email: emails[0].value,
      name: name?.givenName || '',
      accessToken,
    };

    // Gọi service để lưu hoặc kiểm tra user
    return await this.authService.validateAccount(user);
  }
}
