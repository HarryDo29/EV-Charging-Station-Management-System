import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from './entity/transaction.entity';
import { AccountService } from 'src/account/account.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly accountService: AccountService,
  ) {}

  async getAllTransactions(id: string): Promise<TransactionEntity[]> {
    const account = await this.accountService.findAccountById(id);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return await this.transactionRepository.find({
      where: {
        account_id: account.id,
      },
      relations: ['account'],
      order: {
        created_at: 'DESC',
      },
    });
  }
}
