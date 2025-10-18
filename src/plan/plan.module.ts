import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanEntity } from './entity/plan.entity';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { UserSubcriptionService } from './user_subcription.service';
import { UserSubscriptionsEntity } from './entity/user_subscriptions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanEntity, UserSubscriptionsEntity])],
  controllers: [PlanController],
  providers: [PlanService, UserSubcriptionService],
})
export class PlanModule {}
