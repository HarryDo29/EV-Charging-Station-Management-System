import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { Body, Request } from '@nestjs/common';
import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';
import type { Request as RequestExpress } from 'express';

@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully and payment link generated' })
  @ApiResponse({ status: 400, description: 'Invalid transaction data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all transactions for an account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'List of transactions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllTransactions(@Param('id') id: string) {
    return await this.transactionService.getAllTransactions(id);
  }
}
