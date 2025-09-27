import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReservationStatus } from 'src/enums/reservation.enum';
import { ChargePointEntity } from './charge_point.entity';
import { AccountEntity } from 'src/account/entity/account.entity';

@Entity('reservations')
export class ReservationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  reservation_day: string; // format: YYYY-MM-DD

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @Column()
  total_time: number;

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

  @ManyToOne(
    () => ChargePointEntity,
    (charge_point) => charge_point.reservations,
  )
  charge_point: ChargePointEntity;
  @Column()
  charge_point_id: string;

  @ManyToOne(() => AccountEntity, (account) => account.reservations)
  account: AccountEntity;
  @Column()
  account_id: string;
}
