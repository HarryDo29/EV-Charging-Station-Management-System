import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderEntity } from 'src/order/entity/order.entity';
import { OrderItemEntity } from 'src/order/entity/order_item.entity';
import { OrderType } from 'src/enums/orderType.enum';
import { ReservationEntity } from 'src/station/entity/reservation.entity';
import { differenceInHours, parse } from 'date-fns';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(ReservationEntity)
    private readonly reservationRepository: Repository<ReservationEntity>,
  ) {}

  // create order for reservation
  async createOrderForReservation(reservationId: string): Promise<OrderEntity> {
    console.log('reservationId', reservationId);
    // get reservation
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['account', 'charge_point', 'vehicle'],
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // create order
    const order = this.orderRepository.create({
      order_type: OrderType.RESERVATION,
      account: { id: reservation.account.id },
    });
    console.log('order', order);
    const savedOrder = await this.orderRepository.save(order);
    console.log('savedOrder', savedOrder);

    // calculate total price
    const baseDate = new Date();
    const startTime = parse(reservation.start_time, 'HH:mm', baseDate);
    const endTime = parse(reservation.end_time, 'HH:mm', baseDate);
    const totalTime = differenceInHours(endTime, startTime);
    const totalPrice =
      reservation.charge_point.pricePerKwh *
      reservation.vehicle.charging_power_kw *
      totalTime;

    console.log('order', savedOrder);

    // create order item
    const order_item = this.orderItemRepository.create({
      description: `Reservation for ${reservation.charge_point.identifier}`,
      reservation: { id: reservation.id },
      total_price: totalPrice,
      quantity: 1,
      order: { id: savedOrder.id },
    });
    // update order amount
    savedOrder.total_amount = savedOrder.total_amount + order_item.total_price;
    await this.orderRepository.save(savedOrder);
    // save order item
    await this.orderItemRepository.save(order_item);
    return savedOrder;
  }
}
