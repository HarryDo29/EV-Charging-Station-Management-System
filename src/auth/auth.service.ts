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
// import { MailService } from 'src/mail/mail.service';
import { RegisterDto } from './dto/registerAccount.dto';
import { LoginDto } from './dto/loginAccount.dto';
import { UserResponseDto } from 'src/account/dto/userResponse.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { OAuth2Dto } from './dto/oauth2.dto';
import { CreateOAuth2AccountDto } from 'src/account/dto/createdOAuth2Account.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly jwtService: JwtCustomService,
    private readonly argon2Service: Argon2Service,
    private readonly redisService: RedisService,
    private readonly refreshTokenService: RefreshTokenService,
    // private readonly mailService: MailService,
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
  ) {}

  async validateAccount(oauth2Dto: OAuth2Dto): Promise<UserResponseDto> {
    const { email, name, avatar_url, google_id } = oauth2Dto;
    // check if account already exists
    const account = await this.accountService.findAccountByEmail(email);
    if (account) {
      return account;
    }
    // create account
    const nCreated = new CreateOAuth2AccountDto();
    nCreated.email = email;
    nCreated.full_name = name;
    nCreated.avatar_url = avatar_url;
    nCreated.google_id = google_id;
    return await this.accountService.createOAuth2Account(nCreated);
  }

  async loginByOAuth2(account: UserResponseDto): Promise<{
    userResponse: UserResponseDto;
    accessToken: string;
    refreshToken: string;
  }> {
    // generate access and refresh tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign({
        id: account.id,
        name: account.full_name,
        role: account.role,
      }),
      this.jwtService.signRefreshToken({
        id: account.id,
        name: account.full_name,
        role: account.role,
      }),
    ]);
    // set access token to redis
    await Promise.all([
      this.redisService.set(`id:${account.id}`, accessToken, 60 * 60),
      this.refreshTokenService.createRefreshToken(account.id, refreshToken),
    ]);
    return {
      userResponse: {
        id: account.id,
        full_name: account.full_name,
        email: account.email,
        phone_number: account.phone_number,
        role: account.role,
        is_verified: account.is_verified,
        is_active: account.is_active,
        is_oauth2: account.is_oauth2,
        avatar_url: account.avatar_url || '',
      },
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async registerByEmail(registerDto: RegisterDto): Promise<{
    userResponse: UserResponseDto;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password, full_name } = registerDto;
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
    console.log('newAccount', newAccount);
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign({
        id: newAccount.id,
        name: newAccount.full_name,
        role: newAccount.role,
      }),
      this.jwtService.signRefreshToken({
        id: newAccount.id,
        name: newAccount.full_name,
        role: newAccount.role,
      }),
    ]);
    console.log('accessToken', accessToken);
    console.log('refreshToken', refreshToken);
    // set access token to redis
    await Promise.all([
      this.redisService.set(`id:${newAccount.id}`, accessToken, 60 * 60),
      this.refreshTokenService.createRefreshToken(newAccount.id, refreshToken),
    ]);
    return {
      userResponse: {
        id: newAccount.id,
        full_name: newAccount.full_name,
        email: newAccount.email,
        phone_number: newAccount.phone_number,
        role: newAccount.role,
        is_verified: newAccount.is_verified,
        is_active: newAccount.is_active,
        is_oauth2: newAccount.is_oauth2,
        avatar_url: newAccount.avatar_url || '',
      },
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async loginByEmail(loginDto: LoginDto): Promise<{
    userResponse: UserResponseDto;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password } = loginDto;
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
      this.jwtService.sign({
        id: account.id,
        name: account.full_name,
        role: account.role,
      }),
      this.jwtService.signRefreshToken({
        id: account.id,
        name: account.full_name,
        role: account.role,
      }),
    ]);
    // set access token to redis
    await Promise.all([
      this.redisService.set(`id:${account.id}`, accessToken, 60 * 60),
      this.refreshTokenService.updateRefreshToken(account.id, refreshToken),
    ]);
    return {
      userResponse: {
        id: account.id,
        full_name: account.full_name,
        email: account.email,
        phone_number: account.phone_number,
        is_verified: account.is_verified,
        is_active: account.is_active,
        is_oauth2: account.is_oauth2,
        role: account.role,
        avatar_url: account.avatar_url || '',
      },
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
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
    // await this.mailService.sendOtpVerification(
    //   account.email,
    //   passcode.toString(),
    // );
    return;
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
    if (emailVerifiedToken['passcode'] !== Number(passcode)) {
      throw new UnauthorizedException('Invalid passcode');
    }
    // update account is verified
    await this.accountRepo.update(id, {
      is_verified: true,
    });
    return;
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    // find account by id
    const account = await this.accountService.findAccountById(id);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    // compare old password
    const isOldPasswordValid = await this.argon2Service.compare(
      changePasswordDto.oldPassword,
      account.password_hash,
    );
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }
    // update account password
    const hashedPassword = await this.argon2Service.hash(
      changePasswordDto.password,
    );
    await this.accountRepo.update(id, {
      password_hash: hashedPassword,
    });
    return;
  }

  async logout(account: AccountEntity): Promise<void> {
    // remove access token and refresh token from redis and database
    await Promise.all([
      this.redisService.del(`id:${account.id}`),
      this.refreshTokenService.updateRefreshToken(account.id, ''),
    ]);
  }
}
