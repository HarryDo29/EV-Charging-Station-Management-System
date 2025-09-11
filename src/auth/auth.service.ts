import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Argon2Service } from 'src/argon2/argon2.service';
import { AccountService } from 'src/account/account.service';
import { JwtCustomService } from 'src/jwt/jwt.service';
import { CreateAccountDto } from 'src/account/dto/createdAccount.dto';
import { RedisService } from 'src/redis/redis.service';
import { RefreshTokenService } from 'src/refreshToken/refreshToken.service';
import { AccountEntity } from 'src/account/entity/account.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly jwtService: JwtCustomService,
    private readonly argon2Service: Argon2Service,
    private readonly redisService: RedisService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly mailService: MailService,
  ) {}

  async registerByEmail(
    email: string,
    password: string,
    full_name: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // check if account already exists
    const account = await this.accountService.findAccountByEmail(email);
    if (account) {
      throw new BadRequestException('Account already exists');
    }
    // create account
    const nCreated = new CreateAccountDto();
    nCreated.email = email;
    nCreated.password = password;
    nCreated.full_name = full_name;
    const newAccount = await this.accountService.createAccount(nCreated);
    // generate access and refresh tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign({ id: newAccount.id }),
      this.jwtService.signRefreshToken({ id: newAccount.id }),
    ]);
    // set access token to redis
    await this.redisService.set(`id:${newAccount.id}`, accessToken, 60 * 60);
    // set refresh token to database
    await this.refreshTokenService.createRefreshToken(
      newAccount.id,
      refreshToken,
    );
    return { accessToken, refreshToken };
  }

  async loginByEmail(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // find account by email
    const account = await this.accountService.findAccountByEmail(email);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    // compare password
    const isPasswordValid = await this.argon2Service.compare(
      password,
      account.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    // generate access and refresh tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign({ id: account.id }),
      this.jwtService.signRefreshToken({ id: account.id }),
    ]);
    // set access token to redis
    await this.redisService.set(`id:${account.id}`, accessToken, 60 * 60);
    // set refresh token to database
    await this.refreshTokenService.updateRefreshToken(account.id, refreshToken);
    return { accessToken, refreshToken };
  }

  async validateAccessToken(accessToken: string): Promise<AccountEntity> {
    // verify access token
    const decoded = this.jwtService.verify(accessToken);
    if (!decoded) {
      throw new UnauthorizedException('Invalid access token');
    }
    // find account by id
    const account = await this.accountService.findAccountById(
      decoded['id'] as string,
    );
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async sendPasscode(account: AccountEntity): Promise<void> {
    // check if account is verified
    if (account.is_verified) {
      throw new BadRequestException('Account already verified');
    }
    // generate passcode
    const passcode = Math.floor(100000 + Math.random() * 900000);
    // create email verified token
    const emailVerifiedToken = this.jwtService.signEmailToken({
      id: account.id,
      passcode: passcode,
    });
    // set passcode to redis
    await this.redisService.set(
      `Email_verified:${account.id}`,
      emailVerifiedToken,
      60 * 5,
    );
    // send email
    await this.mailService.sendMail(
      account.email,
      'Passcode',
      passcode.toString(),
    );
  }

  async validateEmail(passcode: string, id: string): Promise<void> {
    // get email verified token from redis
    const emailVerifiedTokenFromRedis = await this.redisService.get(
      `Email_verified:${id}`,
    );
    if (!emailVerifiedTokenFromRedis) {
      throw new NotFoundException('Passcode not found');
    }
    // decode email verified token
    const emailVerifiedToken = this.jwtService.verifyEmailToken(
      emailVerifiedTokenFromRedis,
    );
    if (!emailVerifiedToken) {
      throw new UnauthorizedException('Invalid email verified token');
    }
    // check if passcode is valid
    if (emailVerifiedToken['passcode'] !== passcode) {
      throw new UnauthorizedException('Invalid passcode');
    }
    // update account is verified
    await this.accountService.updateAccount(id, {
      is_verified: true,
    });
  }
}
