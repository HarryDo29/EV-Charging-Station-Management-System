import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentGateway } from './payment.gateway'; // Import Gateway for sending signal to Frontend
import type { Webhook } from '@payos/node';
import { type Response as ExpressResponse } from 'express';
import { Repository } from 'typeorm';
import { TransactionEntity } from 'src/transaction/entity/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentGateway: PaymentGateway, // Inject Gateway for sending signal to Frontend
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  // Endpoint for PayOS to call when there is an update in status
  @Post('webhook')
  async handleWebhook(@Body() body: Webhook, @Res() res: ExpressResponse) {
    try {
      // 1. Verify webhook data
      const verifiedData = await this.paymentService.handleWebhook(body);
      console.log('verifiedData', verifiedData);
      // 2. Find transaction with order relation
      const transaction = await this.transactionRepository.findOne({
        where: {
          order_code: verifiedData?.orderCode,
        },
        relations: ['order'],
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      if (!transaction.order) {
        throw new NotFoundException('Order not found for this transaction');
      }

      // 3. Response immediately: 200 OK (BEFORE sending WebSocket)
      res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Webhook received successfully',
      });

      // 4. After response, send WebSocket signal to Frontend
      // Note: Client MUST have already joined the room via socket.emit('joinPaymentRoom')
      const status = verifiedData?.code === '00' ? 'SUCCESS' : 'FAILED';
      this.paymentGateway.sendPaymentStatus(transaction.order.id, status);
    } catch (error) {
      console.error('Failed to process webhook:', error);

      // Only send error response if not already sent
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to process webhook',
        });
      }
    }
  }
}
