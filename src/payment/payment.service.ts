import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PayOS, Webhook } from '@payos/node';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('PAYOS_INSTANCE')
    private readonly payOS: PayOS,
  ) {}

  generateOrderCode(): bigint {
    // 1. Lấy timestamp hiện tại (13 chữ số)
    const timestamp = Date.now();
    // 2. Tạo một số ngẫu nhiên có 4 chữ số (từ 0000 đến 9999)
    const randomSuffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    // 3. Ghép chúng lại và chuyển thành BigInt để đảm bảo an toàn
    return BigInt(String(timestamp) + randomSuffix);
  }

  async createPaymentLink(amount: number, description: string) {
    const order = {
      orderCode: Number(this.generateOrderCode()),
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
