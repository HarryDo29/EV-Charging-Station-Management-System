import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { Body, Request } from '@nestjs/common';
import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';
import type { Request as RequestExpress } from 'express';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('')
  @UseGuards(AuthGuard('jwt'))
  async createTransaction(
    @Body() body: CreateTransactionDto,
    @Request() req: RequestExpress,
  ) {
    const acc = req.user as AuthenticatedUserDto;
    const transaction = new CreateTransactionDto();
    transaction.amount = body.amount;
    transaction.type = body.type;
    transaction.order_id = body.order_id;
    const createdTransaction = await this.transactionService.createTransaction(
      transaction,
      acc.id,
    );
    console.log('createdTransaction', createdTransaction);
    return createdTransaction;
  }

  @Get('/get-all-transactions/:id')
  @UseGuards(AuthGuard('jwt'))
  async getAllTransactions(@Param('id') id: string) {
    return await this.transactionService.getAllTransactions(id);
  }
}
