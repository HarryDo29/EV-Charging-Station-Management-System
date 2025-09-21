import { StationStatus } from 'src/enums/stationStatus.enum';
import { ConnectorType } from 'src/enums/connector.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { ChargePointEntity } from './charge_point.entity';
import { StaffEntity } from 'src/staff/entity/staff.entity';

@Entity('stations')
export class StationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  identifier: string;

  @Column()
  name: string;

  @Column({ unique: true })
  address: string;

  // vĩ độ
  @Column('decimal', { precision: 9, scale: 6 })
  latitude: number;

  // kinh độ
  @Column('decimal', { precision: 9, scale: 6 })
  longitude: number;

  @Column({
    type: 'enum',
    enum: StationStatus,
    default: StationStatus.UNAVAILABLE,
  })
  status: StationStatus;

  @Column({ type: 'enum', enum: ConnectorType, array: true, nullable: true })
  connectorTypes: ConnectorType[]; //example: ["CCS2","CHAdeMO"]

  @Column('int', { nullable: false })
  powerKw: number; // unit: kW

  @Column('numeric', { nullable: true })
  pricePerKwh: number; // unit: VND/kWh

  @Column('int', { default: 0 })
  totalPorts: number;

  @Column('int', { default: 0 })
  availablePorts: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ChargePointEntity, (charge_point) => charge_point.station, {
    cascade: true,
  })
  charge_points: ChargePointEntity[];

  @OneToMany(() => StaffEntity, (staff) => staff.station)
  staff: StaffEntity[];
}
