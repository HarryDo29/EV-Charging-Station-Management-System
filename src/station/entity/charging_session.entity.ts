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
import { ChargePointEntity } from './charge_point.entity';

@Entity('charging_session')
export class ChargingSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  day: string; // format: YYYY-MM-DD

  @Column()
  start_time: string;

  @Column()
  end_time: string;

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

  // relationship with reservation
  @OneToOne(
    () => ReservationEntity,
    (reservation) => reservation.charging_session,
  )
  reservation: ReservationEntity;
}
