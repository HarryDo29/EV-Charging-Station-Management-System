import { AccountEntity } from 'src/account/entity/account.entity';
import { TransactionMethod } from 'src/enums/transactionMethod.enum';
import { TransactionStatus } from 'src/enums/transactionStatus.enum';
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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'integer' })
  order_code: number;

  @Column({ type: 'numeric' })
  amount: number;

  @Column({ type: 'enum', enum: TransactionMethod })
  method: TransactionMethod;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => AccountEntity, (account) => account.transactions)
  account: AccountEntity;
  @Column()
  account_id: string;
}
