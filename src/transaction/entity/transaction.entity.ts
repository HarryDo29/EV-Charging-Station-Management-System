import { AccountEntity } from 'src/account/entity/account.entity';
import { TransactionMethod } from 'src/enums/transactionMethod.enum';
import { TransactionStatus } from 'src/enums/transactionStatus.enum';
import { ChargePointEntity } from 'src/station/entity/charge_point.entity';
import { ChargingSessionEntity } from 'src/station/entity/charging_session.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
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

  // relationship with account
  @ManyToOne(() => AccountEntity, (account) => account.transactions)
  account: AccountEntity;
  @Column()
  account_id: string;

  // relationship with charge point
  @ManyToOne(
    () => ChargePointEntity,
    (charge_point) => charge_point.transactions,
  )
  charge_point: ChargePointEntity;
  @Column({ nullable: true })
  charge_point_id: string;

  // relationship with charging session
  @OneToOne(
    () => ChargingSessionEntity,
    (charging_session) => charging_session.transaction,
  )
  charging_session: ChargingSessionEntity;
  @Column({ nullable: true })
  charging_session_id: string;
}
