import { TransactionMethod } from 'src/enums/transactionMethod.enum';
import { TransactionStatus } from 'src/enums/transactionStatus.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  order_code: string;

  @Column({ type: 'numeric' })
  amount: number;

  @Column({ type: 'enum', enum: TransactionMethod })
  method: TransactionMethod;

  @Column({ type: 'enum', enum: TransactionStatus })
  status: TransactionStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
