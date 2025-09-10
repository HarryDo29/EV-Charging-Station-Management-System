import { Injectable } from '@nestjs/common';
import { Argon2Service } from 'src/argon2/argon2.service';
import { AccountService } from 'src/account/account.service';
import { JwtCustomService } from 'src/jwt/jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly jwtService: JwtCustomService,
    private readonly argon2Service: Argon2Service,
  ) {}
}
