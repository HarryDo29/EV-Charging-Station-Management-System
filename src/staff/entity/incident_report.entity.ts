import {
  CreateDateColumn,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ReportStatus } from 'src/enums/reportStatus.enum';
import { StaffEntity } from './staff.entity';
import { ChargePointEntity } from 'src/station/entity/charge_point.entity';

@Entity('incident_reports')
export class IncidentReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.REPORT_PENDING,
  })
  status: ReportStatus;

  @Column()
  report_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => StaffEntity, (staff) => staff.incident_reports)
  staff: StaffEntity;
  @Column()
  staff_id: string;

  @ManyToOne(
    () => ChargePointEntity,
    (charge_point) => charge_point.incident_reports,
  )
  charge_point: ChargePointEntity;
  @Column()
  charge_point_id: string;
}
