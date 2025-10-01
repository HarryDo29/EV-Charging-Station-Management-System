import { AccountEntity } from 'src/account/entity/account.entity';
import { TransactionMethod } from 'src/enums/transactionMethod.enum';
import { TransactionStatus } from 'src/enums/transactionStatus.enum';
import { ChargePointEntity } from 'src/station/entity/charge_point.entity';
import { ReservationEntity } from 'src/station/entity/reservation.entity';
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

  @ManyToOne(
    () => ChargePointEntity,
    (charge_point) => charge_point.transactions,
  )
  charge_point: ChargePointEntity;
  @Column({ nullable: true })
  charge_point_id: string;

  @ManyToOne(() => ReservationEntity, (reservation) => reservation.transactions)
  reservation: ReservationEntity;
  @Column({ nullable: true })
  reservation_id: string;
}
