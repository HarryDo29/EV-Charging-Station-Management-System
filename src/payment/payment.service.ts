import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PayOS, Webhook } from '@payos/node';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from 'src/transaction/entity/transaction.entity';
import { TransactionStatus } from 'src/enums/transactionStatus.enum';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('PAYOS_INSTANCE')
    private readonly payOS: PayOS,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly mailService: MailService,
  ) {}

  generateOrderCode(): number {
    // Similar to PayOS docs: microtime(true) * 10000, get last 6 digits
    const microtime = process.hrtime.bigint(); // High-resolution time (nanoseconds)
    const timestamp = Number(microtime / BigInt(1000000)); // Convert to milliseconds
    const randomSuffix = Math.floor(Math.random() * 10000); // Random 4 digits
    const orderCode = parseInt(`${timestamp}${randomSuffix}`.slice(-8)); // Get last 8 digits
    return orderCode;
  }

  async createPaymentLink(
    amount: number,
    orderCode: number,
    description: string,
  ) {
    try {
      // Validate input parameters
      if (!amount || amount <= 0) {
        throw new BadRequestException('Amount must be greater than 0');
      }
      if (!orderCode) {
        throw new BadRequestException('Order code is required');
      }

      const order = {
        orderCode: orderCode,
        amount: amount,
        description: description || `Payment for order ${orderCode}`,
        cancelUrl: `http://localhost:5173/payment/cancel`,
        returnUrl: `http://localhost:5173/payment/return`,
      };

      console.log('Creating PayOS payment link with order:', order);

      const paymentLink = await this.payOS.paymentRequests.create(order);

      console.log(
        'PayOS payment link created successfully:',
        paymentLink.checkoutUrl,
      );

      return paymentLink;
    } catch (error) {
      // 1. Check if error is an instance of Error
      if (error instanceof Error) {
        // 2. Now TypeScript knows `error` has a `message` property
        console.error('Failed to create payment link:', error.message);
        throw new BadRequestException(
          `Failed to create payment link: ${error.message}`,
        );
      } else {
        // Handle errors that are not instances of Error
        console.error('An unexpected error occurred:', error);
        throw new BadRequestException(
          'An unexpected error occurred at create payment link',
        );
      }
    }
  }

  async handleWebhook(webhookBody: Webhook) {
    try {
      const verifiedData = await this.payOS.webhooks.verify(webhookBody);

      console.log('PayOS Webhook verified data:', verifiedData);

      // Logic to handle business:
      // 1. Find order in DB with verifiedData.orderCode
      const transaction = await this.transactionRepository.findOne({
        where: {
          order_code: verifiedData.orderCode,
        },
        relations: ['account', 'charge_point', 'reservation'],
      });
      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }
      // 2. Update order status (PAID / CANCELLED)
      if (verifiedData.code === '00') {
        await this.transactionRepository.update(
          { order_code: verifiedData.orderCode },
          { status: TransactionStatus.SUCCESS },
        );
      } else {
        await this.transactionRepository.update(
          { order_code: verifiedData.orderCode },
          { status: TransactionStatus.FAILED },
        );
      }
      // 3. Send email confirmation...
      if (verifiedData.code === '00') {
        await this.mailService.sendPaymentSuccess(
          transaction.account.email,
          transaction,
        );
      } else {
        await this.mailService.sendPaymentFailed(
          transaction.account.email,
          transaction,
        );
      }
      return verifiedData; // Return verified data to controller
    } catch (error) {
      // 1. Check if error is an instance of Error
      if (error instanceof Error) {
        // 2. Now TypeScript knows `error` has a `message` property
        console.error('Failed to verify webhook:', error.message);
        throw new BadRequestException(
          `Failed to verify webhook: ${error.message}`,
        );
      } else {
        // Handle errors that are not instances of Error
        console.error('An unexpected error occurred:', error);
        throw new BadRequestException(
          'An unexpected error occurred at verify webhook',
        );
      }
    }
  }
}
