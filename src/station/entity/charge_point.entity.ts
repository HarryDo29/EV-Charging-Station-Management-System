import { ConnectorType } from 'src/enums/connector.enum';
import { StationStatus } from 'src/enums/stationStatus.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { StationEntity } from './station.entity';

@Entity('charge_points')
export class ChargePointEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  identifier: string;

  @Column({ type: 'enum', enum: ConnectorType })
  connector_type: ConnectorType;

  @Column({ nullable: false })
  max_power_kw: number; // unit: kW

  @Column({ nullable: false })
  price_per_kwh: number; // unit: VND/kWh

  @Column({
    type: 'enum',
    enum: StationStatus,
    default: StationStatus.UNAVAILABLE,
  })
  status: StationStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => StationEntity, (station) => station.charge_points)
  @JoinColumn({ name: 'station_id' })
  station: StationEntity;

  @Column()
  station_id: string;
  // FK column to store UUID of station
}
