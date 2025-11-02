import { AccountEntity } from 'src/account/entity/account.entity';
import { TransactionMethod } from 'src/enums/transactionMethod.enum';
import { TransactionStatus } from 'src/enums/transactionStatus.enum';
import { TransactionType } from 'src/enums/transactionType.enum';
import { OrderEntity } from 'src/order/entity/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid') // UUID for transaction
  id: string;

  @Column({ unique: true, nullable: false }) // display code for user
  transaction_code: string;

  @Column({ unique: true, type: 'integer' }) // order code for payment
  order_code: number;

  @Column({ type: 'numeric' })
  amount: number;

  @Column({ type: 'enum', enum: TransactionType, nullable: false })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionMethod,
    default: TransactionMethod.PAYOS,
  })
  method: TransactionMethod;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ nullable: false })
  date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // relationship with account
  @ManyToOne(() => AccountEntity, (account) => account.transactions)
  account: AccountEntity;

  // relation with order
  @ManyToOne(() => OrderEntity, (order) => order.transaction)
  order: OrderEntity;
}
