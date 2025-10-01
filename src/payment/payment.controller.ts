import { Controller, Post, Body, HttpStatus, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { EventsGateway } from '../event/event.gateway'; // Import Gateway for sending signal to Frontend
import type { Webhook } from '@payos/node';
import { type Response as ExpressResponse } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly eventsGateway: EventsGateway, // Inject Gateway for sending signal to Frontend
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
      // After processing, use Gateway to send signal to Frontend
      if (verifiedData.code === '00') {
        this.eventsGateway.sendPaymentStatus(
          verifiedData.orderCode,
          'PAID',
          'Payment successful!',
        );
      } else {
        this.eventsGateway.sendPaymentStatus(
          verifiedData.orderCode,
          'FAILED',
          'Payment failed.',
        );
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
