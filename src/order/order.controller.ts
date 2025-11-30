import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/reservation')
  @UseGuards(AuthGuard('jwt'))
  async createOrderForReservation(
    @Body() createOrderForReservation: { reservationId: string },
  ) {
    console.log('createOrderForReservation', createOrderForReservation);
    const { reservationId } = createOrderForReservation;
    return await this.orderService.createOrderForReservation(reservationId);
  }
}
