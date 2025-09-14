import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from 'src/enums/role.enum';
import { AccountService } from 'src/account/account.service';
import { AuthenticatedUserDto } from '../dto/authenticated-user.dto';

// Define data type for payload
interface JwtPayload {
  id: string; // Usually is ID
  name: string;
  role: Role; // Assume you have roles in token
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly accountService: AccountService,
  ) {
    super({
      // 1. Specify how to extract token from request
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. Do not skip when token expires
      ignoreExpiration: false,
      // 3. Provide secret key to Passport to verify token signature
      secretOrKey: configService.get<string>('SECRET_KEY_ACCESS_TOKEN')!,
    });
  }

  /**
   * This method will be called automatically by Passport
   * after it has successfully verified the token signature and expiration date.
   * @param payload Data decoded from token.
   * @returns Object will be attached to request.user
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUserDto> {
    // Here, you can perform additional logic checks,
    // for example: check if user ID in payload exists in DB.
    const account = await this.accountService.findAccountById(payload.id);
    if (!account) {
      throw new UnauthorizedException('Account not found');
    }
    // If everything is ok, return the user object will be attached to request
    return {
      id: payload.id,
      name: payload.name,
      role: payload.role,
    };
  }
}
