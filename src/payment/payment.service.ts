import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PayOS, Webhook } from '@payos/node';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('PAYOS_INSTANCE')
    private readonly payOS: PayOS,
  ) {}

  generateOrderCode(): number {
    // Tương tự docs PayOS: microtime(true) * 10000, lấy 6 chữ số cuối
    const microtime = process.hrtime.bigint(); // High-resolution time (nanoseconds)
    const timestamp = Number(microtime / BigInt(1000000)); // Chuyển sang mili giây
    const randomSuffix = Math.floor(Math.random() * 10000); // Random 4 chữ số
    const orderCode = parseInt(`${timestamp}${randomSuffix}`.slice(-8)); // Lấy 8 chữ số cuối
    return orderCode;
  }

  async createPaymentLink(
    amount: number,
    orderCode: number,
    description: string,
  ) {
    const order = {
      orderCode: orderCode,
      amount: amount,
      description: description,
      currency: 'VND',
      cancelUrl: `http://localhost:5173/payment/cancel`,
      returnUrl: `http://localhost:5173/payment/return`,
      orderExpiredTime: 60 * 5,
    };
    const paymentLink = await this.payOS.paymentRequests.create(order);
    return paymentLink;
  }

  async handleWebhook(webhookBody: Webhook) {
    try {
      const verifiedData = this.payOS.webhooks.verify(webhookBody);

      // Logic xử lý nghiệp vụ:
      // 1. Tìm đơn hàng trong DB với verifiedData.orderCode
      // 2. Cập nhật trạng thái đơn hàng (PAID / CANCELLED)
      // 3. Gửi email xác nhận...

      return verifiedData; // Trả về dữ liệu đã xác thực để controller sử dụng
    } catch (error) {
      console.error('Webhook verification failed:', error);
      throw new BadRequestException('Invalid webhook signature');
    }
  }
}
