import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';
import { ReservationEntity } from 'src/station/entity/reservation.entity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @Column({ type: 'float' })
  total_price: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // relationship with order
  @ManyToOne(() => OrderEntity, (order) => order.items)
  order: OrderEntity;

  // relationship with reservation
  @ManyToOne(() => ReservationEntity, (reservation) => reservation.items)
  reservation: ReservationEntity;
}
