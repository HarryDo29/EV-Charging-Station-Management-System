import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountEntity } from 'src/account/entity/account.entity';
import { IVehicle } from '../interface/vehicle.interface';
import { ConnectorType } from 'src/enums/connector.enum';
import { ReservationEntity } from 'src/station/entity/reservation.entity';

@Entity('vehicles')
export class VehicleEntity implements IVehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  car_maker: string;

  @Column()
  models: string;

  @Column({ unique: true })
  license_plate: string;

  @Column({ type: 'enum', enum: ConnectorType })
  connector_type: ConnectorType;

  @Column({ type: 'float' })
  battery_capacity_kwh: number;

  @Column({ type: 'float' })
  charging_power_kw: number;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => AccountEntity, (account) => account.vehicles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' }) // foreign key
  account: AccountEntity;

  @Column()
  account_id: string; // FK column to store UUID of account

  @OneToMany(() => ReservationEntity, (reservation) => reservation.vehicle)
  reservations: ReservationEntity[];
}
