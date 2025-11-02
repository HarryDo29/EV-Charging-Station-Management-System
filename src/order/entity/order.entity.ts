import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountEntity } from 'src/account/entity/account.entity';
import { OrderType } from 'src/enums/orderType.enum';
import { OrderStatus } from 'src/enums/orderStatus.enum';
import { OrderItemEntity } from 'src/order/entity/order_item.entity';
import { TransactionEntity } from 'src/transaction/entity/transaction.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  order_type: OrderType;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  order_status: OrderStatus;

  @Column({ nullable: true })
  amount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // relationship with account
  @ManyToOne(() => AccountEntity, (account) => account.orders)
  account: AccountEntity;

  // relationship with order items
  @OneToMany(() => OrderItemEntity, (item) => item.order)
  items: OrderItemEntity[];

  // relationship with transaction
  @OneToMany(() => TransactionEntity, (transaction) => transaction.order)
  transaction: TransactionEntity[];
}
