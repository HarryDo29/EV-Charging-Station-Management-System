import { ConnectorType } from 'src/enums/connector.enum';
import { StationStatus } from 'src/enums/stationStatus.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { StationEntity } from './station.entity';
import { IncidentReportEntity } from 'src/staff/entity/incident_report.entity';
import { ReservationEntity } from './reservation.entity';
import { TransactionEntity } from 'src/transaction/entity/transaction.entity';

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

  @Column({ nullable: false })
  parking_fee_per_hour: number; // unit: VND/hour

  @Column({ default: false })
  reserved_status: boolean;

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

  @OneToMany(
    () => IncidentReportEntity,
    (incident_report) => incident_report.charge_point,
  )
  incident_reports: IncidentReportEntity[];

  @OneToMany(() => ReservationEntity, (reservation) => reservation.charge_point)
  reservations: ReservationEntity[];

  @OneToMany(() => TransactionEntity, (transaction) => transaction.charge_point)
  transactions: TransactionEntity[];
}
