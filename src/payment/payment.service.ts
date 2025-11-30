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
// import { MailService } from 'src/mail/mail.service';
// import { OrderEntity } from 'src/order/entity/order.entity';
// import { AccountEntity } from 'src/account/entity/account.entity';
// import { StationEntity } from 'src/station/entity/station.entity';
// import { ReservationEntity } from 'src/station/entity/reservation.entity';
// import { ChargePointEntity } from 'src/station/entity/charge_point.entity';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('PAYOS_INSTANCE')
    private readonly payOS: PayOS,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    // @InjectRepository(OrderEntity)
    // private readonly orderRepository: Repository<OrderEntity>,
    // @InjectRepository(AccountEntity)
    // private readonly accountRepository: Repository<AccountEntity>,
    // @InjectRepository(StationEntity)
    // private readonly stationRepository: Repository<StationEntity>,
    // @InjectRepository(ReservationEntity)
    // private readonly reservationRepository: Repository<ReservationEntity>,
    // @InjectRepository(ChargePointEntity)
    // private readonly chargePointRepository: Repository<ChargePointEntity>,
    // private readonly mailService: MailService,
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
      // 1. Find order in DB with verifiedData.orderCode with nested relations
      const transaction = await this.transactionRepository
        .createQueryBuilder('transaction')
        // Select all transaction fields
        .select([
          'transaction.id',
          'transaction.transaction_code',
          'transaction.order_code',
          'transaction.amount',
          'transaction.type',
          'transaction.method',
          'transaction.status',
          'transaction.date',
          'transaction.created_at',
          'transaction.updated_at',
        ])
        // Join transaction.account
        .leftJoinAndSelect('transaction.account', 'account')
        .addSelect([
          'account.id',
          'account.email',
          'account.full_name',
          'account.phone_number',
        ])
        // Join transaction.order
        .leftJoinAndSelect('transaction.order', 'order')
        .addSelect([
          'order.id',
          'order.order_type',
          'order.order_status',
          'order.total_amount',
          'order.created_at',
          'order.updated_at',
        ])
        // Join order.account
        .leftJoinAndSelect('order.account', 'orderAccount')
        .addSelect([
          'orderAccount.id',
          'orderAccount.email',
          'orderAccount.full_name',
        ])
        // Join order.items
        .leftJoinAndSelect('order.items', 'items')
        .addSelect([
          'items.id',
          'items.description',
          'items.quantity',
          'items.total_price',
        ])
        // Join items.reservation
        .leftJoinAndSelect('items.reservation', 'reservation')
        .addSelect([
          'reservation.id',
          'reservation.reservation_day',
          'reservation.start_time',
          'reservation.end_time',
          'reservation.status',
        ])
        // Join reservation.charge_point
        .leftJoinAndSelect('reservation.charge_point', 'charge_point')
        .addSelect(['charge_point.id', 'charge_point.identifier'])
        // Join charge_point.station
        .leftJoinAndSelect('charge_point.station', 'station')
        .addSelect(['station.id', 'station.name', 'station.address'])
        // Join reservation.vehicle
        .leftJoinAndSelect('reservation.vehicle', 'vehicle')
        .addSelect(['vehicle.id', 'vehicle.license_plate'])
        .where('transaction.order_code = :orderCode', {
          orderCode: verifiedData.orderCode,
        })
        .getOne();

      console.log('transaction', JSON.stringify(transaction, null, 2));

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
      // if (verifiedData.code === '00') {
      //   await this.mailService.sendPaymentSuccess(
      //     transaction.account.email,
      //     transaction,
      //   );
      // } else {
      //   await this.mailService.sendPaymentFailed(
      //     transaction.account.email,
      //     transaction,
      //   );
      // }
      return verifiedData; // Return verified data to controller
    } catch (error) {
      console.error('Failed to verify webhook:', error);
    }
  }
}
