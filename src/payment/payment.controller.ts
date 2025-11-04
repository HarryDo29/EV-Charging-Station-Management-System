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

  // Endpoint for Frontend to call to create QR code
  // @Post('create')
  // async createPaymentLink(@Body() body: CreatePaymentDto) {
  //   return this.paymentService.createPaymentLink(body);
  // }

  // Endpoint for PayOS to call when there is an update in status
  @Post('webhook')
  async handleWebhook(@Body() body: Webhook, @Res() res: ExpressResponse) {
    try {
      const verifiedData = await this.paymentService.handleWebhook(body);
      // Response immediately: 200 OK
      res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Webhook received successfully',
      });
      const transaction = await this.transactionRepository.findOne({
        where: {
          order_code: verifiedData.orderCode,
        },
        relations: ['order'],
      });
      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }
      // After processing, use Gateway to send signal to Frontend
      if (verifiedData.code === '00') {
        this.paymentGateway.sendPaymentStatus(transaction.order.id, 'SUCCESS');
      } else {
        this.paymentGateway.sendPaymentStatus(transaction.order.id, 'FAILED');
      }
    } catch (error) {
      console.error('Failed to process webhook:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to process webhook',
      });
    }
  }
}
