import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/reservation')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create an order for a reservation' })
  @ApiBody({
    schema: {
      properties: {
        reservationId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async createOrderForReservation(
    @Body() createOrderForReservation: { reservationId: string },
  ) {
    console.log('createOrderForReservation', createOrderForReservation);
    const { reservationId } = createOrderForReservation;
    return await this.orderService.createOrderForReservation(reservationId);
  }
}
