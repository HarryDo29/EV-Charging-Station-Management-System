import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { ReservationStatus } from 'src/enums/reservation.enum';
import { ChargePointEntity } from './charge_point.entity';
import { AccountEntity } from 'src/account/entity/account.entity';
import { ChargingSessionEntity } from './charging_session.entity';

@Entity('reservations')
export class ReservationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  reservation_day: string; // format: YYYY-MM-DD

  @Column()
  start_time: Date;

  @Column({ nullable: true })
  end_time: Date;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.RESERVED,
  })
  status: ReservationStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // relationship with charge point
  @ManyToOne(
    () => ChargePointEntity,
    (charge_point) => charge_point.reservations,
  )
  charge_point: ChargePointEntity;
  @Column()
  charge_point_id: string;

  // relationship with account
  @ManyToOne(() => AccountEntity, (account) => account.reservations)
  account: AccountEntity;
  @Column({ nullable: true })
  account_id: string;

  // relationship with charging session
  @OneToOne(
    () => ChargingSessionEntity,
    (charging_session) => charging_session.reservation,
  )
  charging_session: ChargingSessionEntity;
  @Column()
  charging_session_id: string;
}
