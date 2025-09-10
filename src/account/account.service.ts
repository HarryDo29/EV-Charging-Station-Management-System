import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountEntity } from './entity/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Argon2Service } from 'src/argon2/argon2.service';
import { CreateAccountDto } from './dto/createdAccount.dto';
import { UpdateAccountDto } from './dto/updatedAccount.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    private readonly argon2Service: Argon2Service,
  ) {}

  async createAccount(account: CreateAccountDto): Promise<AccountEntity> {
    // hash password
    const hashedPassword = await this.argon2Service.hash(account.password);
    // create account
    const newAccount = this.accountRepository.create({
      ...account,
      password_hash: hashedPassword,
    });
    // save account
    return this.accountRepository.save(newAccount);
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
}
