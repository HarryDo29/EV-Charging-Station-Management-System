import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ReservationService } from '../station/reservation.service';
import { OrderService } from 'src/order/order.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request as RequestExpress } from 'express';
import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';
import { TransactionType } from 'src/enums/transactionType.enum';
import { CreateReservationDto } from 'src/station/dto/reservation/createReservation.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('checkout')
export class CheckOutController {
  constructor(
    private readonly reservService: ReservationService,
    private readonly orderService: OrderService,
    private readonly transacService: TransactionService,
  ) {}

  @Post('/reservation')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Checkout a reservation' })
  @ApiResponse({
    status: 200,
    description: 'Reservation checked out successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid reservation data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async checkoutReservation(
    @Req() req: RequestExpress,
    @Body()
    body: {
      reservation_day: string;
      start_time: string;
      end_time: string;
      charge_point_id: string;
      vehicle_id: string;
      amount: number;
    },
  ) {
    console.log('start checkout reservation');

    const acc = req.user as AuthenticatedUserDto;
    const {
      reservation_day,
      start_time,
      end_time,
      charge_point_id,
      vehicle_id,
      amount,
    } = body;
    // create reservation
    const createReservationDto: CreateReservationDto = {
      reservation_day,
      start_time,
      end_time,
      charge_point_id,
      vehicle_id,
    };
    const reservation = await this.reservService.createReservation(
      acc.id,
      createReservationDto,
    );
    // create order
    const order = await this.orderService.createOrderForReservation(
      reservation.id,
    );
    // create transaction
    const transaction = await this.transacService.createTransaction(
      {
        amount,
        type: TransactionType.PAY_CHARGING_FEE,
        order_id: order.id,
      },
      acc.id,
    );
    // return response
    return {
      order_id: order.id,
      payment_link: transaction,
    };
  }
}
