import { Role } from 'src/enums/role.enum';
import { IAccount } from '../interface/account.interface';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VehicleEntity } from 'src/vehicle/entity/vehicle.entity';

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
}
