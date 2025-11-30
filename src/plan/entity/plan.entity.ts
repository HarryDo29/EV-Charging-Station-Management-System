import { BillingCycle } from 'src/enums/billingCycle.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserSubscriptionsEntity } from './user_subscriptions.entity';

@Entity('plans')
export class PlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'enum', enum: BillingCycle })
  billing_cycle: BillingCycle;

  @Column({ default: true })
  status: boolean;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  benefits: JSON;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(
    () => UserSubscriptionsEntity,
    (user_subscription) => user_subscription.plan,
  )
  user_subscriptions: UserSubscriptionsEntity[];
}
