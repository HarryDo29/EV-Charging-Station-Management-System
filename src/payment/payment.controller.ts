import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { EventsGateway } from '../event/event.gateway'; // Import Gateway
import type { Webhook } from '@payos/node';

// class CreatePaymentDto {
//   amount: number;
//   description: string;
// }

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly eventsGateway: EventsGateway, // Inject Gateway
  ) {}

  // Endpoint để Frontend gọi tạo mã QR
  // @Post('create')
  // async createPaymentLink(@Body() body: CreatePaymentDto) {
  //   return this.paymentService.createPaymentLink(body);
  // }

  // Endpoint để payOS gọi khi có cập nhật trạng thái
  @Post('webhook')
  async handleWebhook(@Body() body: Webhook) {
    const verifiedData = await this.paymentService.handleWebhook(body);

    // Sau khi xử lý, dùng Gateway để phát tín hiệu về cho Frontend
    if (verifiedData.code === '00') {
      this.eventsGateway.sendPaymentStatus(
        verifiedData.orderCode,
        'PAID',
        'Thanh toán thành công!',
      );
    } else {
      this.eventsGateway.sendPaymentStatus(
        verifiedData.orderCode,
        'FAILED',
        'Thanh toán thất bại.',
      );
    }

    return { success: true };
  }
}
