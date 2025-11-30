import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ReservationStatus } from 'src/enums/reservation.enum';
import { ChargePointEntity } from './charge_point.entity';
import { AccountEntity } from 'src/account/entity/account.entity';
import { ChargingSessionEntity } from './charging_session.entity';
import { VehicleEntity } from 'src/vehicle/entity/vehicle.entity';
import { OrderItemEntity } from 'src/order/entity/order_item.entity';

@Entity('reservations')
export class ReservationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  reservation_day: string; // format: YYYY-MM-DD

  @Column()
  start_time: string;

  @Column()
  end_time: string;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
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

  // relationship with vehicle
  @ManyToOne(() => VehicleEntity, (vehicle) => vehicle.reservations)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: VehicleEntity;

  // relationship with account
  @ManyToOne(() => AccountEntity, (account) => account.reservations)
  account: AccountEntity;

  // relationship with charging session
  @OneToOne(
    () => ChargingSessionEntity,
    (charging_session) => charging_session.reservation,
  )
  charging_session: ChargingSessionEntity;

  // relationship with order items
  @OneToMany(() => OrderItemEntity, (item) => item.reservation)
  items: OrderItemEntity[];
}
