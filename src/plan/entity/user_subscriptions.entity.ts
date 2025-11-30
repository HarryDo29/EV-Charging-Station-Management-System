import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlanEntity } from './plan.entity';
import { AccountEntity } from 'src/account/entity/account.entity';
import { SubscriptionStatus } from 'src/enums/subcriptionStatus.enum';

@Entity('user_subscriptions')
export class UserSubscriptionsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @Column({
    default: SubscriptionStatus.ACTIVE,
    type: 'enum',
    enum: SubscriptionStatus,
  })
  status: SubscriptionStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => PlanEntity, (plan) => plan.user_subscriptions)
  @JoinColumn({ name: 'plan_id' })
  plan: PlanEntity;
  // FK column to store UUID of plan
  @Column()
  plan_id: string;

  @ManyToOne(() => AccountEntity, (account) => account.user_subscriptions)
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;
  // FK column to store UUID of account
  @Column()
  account_id: string;
}
