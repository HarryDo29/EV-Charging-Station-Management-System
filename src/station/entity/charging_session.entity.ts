import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SessionStatus } from 'src/enums/sessionStatus.enum';
import { ReservationEntity } from './reservation.entity';
import { TransactionEntity } from 'src/transaction/entity/transaction.entity';
import { ChargePointEntity } from './charge_point.entity';

@Entity('charging_session')
export class ChargingSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  day: string; // format: YYYY-MM-DD

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @Column()
  total_time: number;

  @Column({ type: 'float', nullable: true })
  energy_consumed_kwh: number;

  @Column({ type: 'float', nullable: true })
  total_price: number;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.IN_PROGRESS,
  })
  status: SessionStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(
    () => ChargePointEntity,
    (charge_point) => charge_point.charging_sessions,
  )
  charge_point: ChargePointEntity;
  @Column()
  charge_point_id: string;

  // relationship with reservation
  @OneToOne(
    () => ReservationEntity,
    (reservation) => reservation.charging_session,
  )
  reservation: ReservationEntity;
  @Column({ nullable: true })
  reservation_id: string;

  // relationship with transaction
  @OneToOne(
    () => TransactionEntity,
    (transaction) => transaction.charging_session,
  )
  transaction: TransactionEntity;
  @Column({ nullable: true })
  transaction_id: string;
}
