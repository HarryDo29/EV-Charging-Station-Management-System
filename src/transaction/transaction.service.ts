import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from './entity/transaction.entity';
import { AccountService } from 'src/account/account.service';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { PaymentService } from 'src/payment/payment.service';
import { CreatePaymentLinkResponse } from '@payos/node';
import { TransactionType } from 'src/enums/transactionType.enum';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly accountService: AccountService,
    private readonly paymentService: PaymentService,
  ) {}

  async generateTransactionCode(transactionType: string): Promise<string> {
    // generate prefix based on transaction type
    const prefix = (() => {
      switch (transactionType) {
        case 'pay_parking_fee':
          return 'PP';
        case 'pay_charging_fee':
          return 'PC';
        case 'pay_other_fee':
          return 'PO';
      }
    })();
    // generate timestamp
    const timestamp = new Date().getTime().toString();
    // generate transaction code
    const tran_code = `${prefix}${timestamp}`;
    // check if transaction code already exists
    const transaction = await this.transactionRepository.findOne({
      where: {
        transaction_code: tran_code,
      },
    });
    if (transaction) {
      return this.generateTransactionCode(transactionType);
    }
    return tran_code;
  }

  async createTransaction(
    transaction: CreateTransactionDto,
    accountId: string,
  ): Promise<CreatePaymentLinkResponse> {
    console.log('transaction', transaction);
    // generate order code
    const orderCode = this.paymentService.generateOrderCode();
    // generate transaction code
    const transactionCode = await this.generateTransactionCode(
      transaction.type,
    );
    console.log('transactionCode', transactionCode);
    // create transaction
    const newTransaction = this.transactionRepository.create({
      amount: transaction.amount,
      type: transaction.type as TransactionType,
      order_code: orderCode,
      transaction_code: transactionCode,
      date: new Date(),
      account: { id: accountId },
      order: { id: transaction.order_id },
    });
    await this.transactionRepository.save(newTransaction);
    // create payment link
    const paymentLink = await this.paymentService.createPaymentLink(
      newTransaction.amount,
      orderCode,
      transactionCode.toString(),
    );
    console.log('paymentLink', paymentLink);
    return paymentLink;
  }

  async getAllTransactions(id: string): Promise<TransactionEntity[]> {
    const account = await this.accountService.findAccountById(id);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return await this.transactionRepository.find({
      where: {
        account: { id: account.id },
      },
      relations: ['account', 'order'],
      order: {
        created_at: 'DESC',
      },
    });
  }
}
