import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountEntity } from './entity/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Argon2Service } from 'src/argon2/argon2.service';
import { CreateAccountDto } from './dto/createdAccount.dto';
import { UpdateAccountDto } from './dto/updatedAccount.dto';
import { CreateOAuth2AccountDto } from './dto/createdOAuth2Account.dto';
import { UserResponseDto } from './dto/userResponse.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    private readonly argon2Service: Argon2Service,
  ) {}

  async createOAuth2Account(
    account: CreateOAuth2AccountDto,
  ): Promise<UserResponseDto> {
    // create account
    const newAccount = this.accountRepository.create(account);
    newAccount.is_oauth2 = true;
    // save account
    const savedAccount = await this.accountRepository.save(newAccount);
    return plainToInstance(UserResponseDto, savedAccount);
  }

  async createAccount(account: CreateAccountDto): Promise<UserResponseDto> {
    // hash password
    const hashedPassword = await this.argon2Service.hash(account.password);
    // create account
    const newAccount = this.accountRepository.create({
      ...account,
      password_hash: hashedPassword,
    });
    // save account
    const savedAccount = await this.accountRepository.save(newAccount);
    return plainToInstance(UserResponseDto, savedAccount);
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
    account_id: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<UserResponseDto | null> {
    // find account
    const acc = await this.accountRepository.findOne({
      where: { id: account_id },
    });
    if (!acc) {
      throw new NotFoundException('Account not found');
    }
    // update account
    const result = await this.accountRepository.update(account_id, {
      ...updateAccountDto,
    });
    if (result.affected === 0) {
      throw new BadRequestException('Failed to update account');
    }
    return await this.findAccountById(account_id);
  }

  async deleteAccount(id: string): Promise<UpdateResult> {
    // find account
    const acc = await this.findAccountById(id);
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
      relations: {
        vehicles: true,
        user_subscriptions: true,
        transactions: true,
      },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return plainToInstance(UserResponseDto, account, {
      excludeExtraneousValues: true,
    });
  }
}
