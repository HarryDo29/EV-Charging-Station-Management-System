import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountEntity } from './entity/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Argon2Service } from 'src/argon2/argon2.service';
import { CreateAccountDto } from './dto/createdAccount.dto';
import { UpdateAccountDto } from './dto/updatedAccount.dto';
import { CreateOAuth2AccountDto } from './dto/createdOAuth2Account.dto';
import { UserResponseDto } from './dto/userResponse.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    private readonly argon2Service: Argon2Service,
  ) {}

  async createOAuth2Account(
    account: CreateOAuth2AccountDto,
  ): Promise<AccountEntity> {
    // create account
    const newAccount = this.accountRepository.create(account);
    newAccount.is_oauth2 = true;
    // save account
    return await this.accountRepository.save(newAccount);
  }

  async createAccount(account: CreateAccountDto): Promise<AccountEntity> {
    // hash password
    const hashedPassword = await this.argon2Service.hash(account.password);
    // create account
    const newAccount = this.accountRepository.create({
      ...account,
      password_hash: hashedPassword,
    });
    // save account
    return await this.accountRepository.save(newAccount);
  }

  async findAccountByEmail(email: string): Promise<AccountEntity | null> {
    const acc = await this.accountRepository.findOne({
      where: { email },
    });
    return acc;
  }

  async findAccountById(id: string): Promise<AccountEntity | null> {
    const acc = await this.accountRepository.findOne({
      where: { id },
    });
    return acc;
  }

  async updateAccount(
    id: string,
    account: UpdateAccountDto,
  ): Promise<UpdateResult> {
    // find account
    const acc = await this.accountRepository.findOne({
      where: { id },
    });
    if (!acc) {
      throw new NotFoundException('Account not found');
    }
    // update account
    return await this.accountRepository.update(id, { ...account });
  }

  async deleteAccount(id: string): Promise<UpdateResult> {
    // find account
    const acc = await this.accountRepository.findOne({
      where: { id },
    });
    if (!acc) {
      throw new NotFoundException('Account not found');
    }
    //delete account
    return await this.accountRepository.update(id, { is_active: false });
  }

  async getAccount(id: string): Promise<UserResponseDto> {
    const account = await this.accountRepository.findOne({
      where: { id },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone_number: true,
        role: true,
        is_verified: true,
        is_active: true,
        is_oauth2: true,
        avatar_url: true,
      },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }
}
