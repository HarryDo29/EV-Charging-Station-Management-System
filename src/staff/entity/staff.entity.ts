import { AccountEntity } from 'src/account/entity/account.entity';
import { StationEntity } from 'src/station/entity/station.entity';
import {
  CreateDateColumn,
  Entity,
  Column,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { IncidentReportEntity } from './incident_report.entity';

@Entity('staff')
export class StaffEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => AccountEntity, (account) => account.staff)
  account: AccountEntity;
  @Column()
  account_id: string;

  @ManyToOne(() => StationEntity, (station) => station.staff)
  station: StationEntity;
  @Column()
  station_id: string;

  @OneToMany(
    () => IncidentReportEntity,
    (incident_report) => incident_report.staff,
  )
  incident_reports: IncidentReportEntity[];
}
