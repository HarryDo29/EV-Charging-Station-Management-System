import { Role } from 'src/enums/role.enum';
import { IAccount } from '../interface/account.interface';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VehicleEntity } from 'src/vehicle/entity/vehicle.entity';
import { UserSubscriptionsEntity } from 'src/plan/entity/user_subscriptions.entity';
import { StaffEntity } from 'src/staff/entity/staff.entity';

@Entity('accounts')
export class AccountEntity implements IAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  full_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone_number: string;

  @Column()
  password_hash: string;

  @Column({ type: 'enum', enum: Role, default: Role.DRIVER })
  role: Role;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => VehicleEntity, (vehicle) => vehicle.account)
  vehicles: VehicleEntity[];

  @OneToMany(
    () => UserSubscriptionsEntity,
    (user_subscription) => user_subscription.account,
  )
  user_subscriptions: UserSubscriptionsEntity[];

  @OneToOne(() => StaffEntity, (staff) => staff.account)
  staff: StaffEntity;
}
