import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('/get-all-transactions/:id')
  @UseGuards(AuthGuard('jwt'))
  async getAllTransactions(@Param('id') id: string) {
    return await this.transactionService.getAllTransactions(id);
  }
}
