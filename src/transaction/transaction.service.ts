import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from './entity/transaction.entity';
import { AccountService } from 'src/account/account.service';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { PaymentService } from 'src/payment/payment.service';
import { CreatePaymentLinkResponse } from '@payos/node';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly accountService: AccountService,
    private readonly paymentService: PaymentService,
  ) {}

  async createTransaction(
    transaction: CreateTransactionDto,
    accountId: string,
  ): Promise<CreatePaymentLinkResponse> {
    // generate order code
    const orderCode = this.paymentService.generateOrderCode();
    // create transaction
    const newTransaction = this.transactionRepository.create({
      ...transaction,
      order_code: orderCode,
      account_id: accountId,
    });
    await this.transactionRepository.save(newTransaction);
    // create payment link
    const paymentLink = await this.paymentService.createPaymentLink(
      newTransaction.amount,
      orderCode,
      orderCode.toString(),
    );
    return paymentLink;
  }

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
