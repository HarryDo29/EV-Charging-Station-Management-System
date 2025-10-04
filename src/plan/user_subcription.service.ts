import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { UserSubscriptionsEntity } from './entity/user_subscriptions.entity';
import { CreatedSubcriptionDto } from './dto/user_subcription/createdSubcription.dto';
import { PlanService } from './plan.service';
import { UpdatedSubcriptionDto } from './dto/user_subcription/updatesubcription.dto';

@Injectable()
export class UserSubcriptionService {
  constructor(
    @InjectRepository(UserSubscriptionsEntity)
    private readonly userSubcriptionRepository: Repository<UserSubscriptionsEntity>,
    private readonly planService: PlanService,
  ) {}

  async createUserSubcription(
    userSubcription: CreatedSubcriptionDto,
  ): Promise<UserSubscriptionsEntity> {
    const { account_id, plan_id, start_date, end_date } = userSubcription;
    // get userSubscription
    const userSub = await this.getUserSubscriptions(account_id, plan_id);
    if (userSub) {
      throw new NotFoundException('User subscription already exists');
    }
    //create userSubscription
    const newUserSubcription = this.userSubcriptionRepository.create({
      start_date: start_date,
      end_date: end_date,
      account_id: account_id,
      plan_id: plan_id,
    });
    //save userSubscription
    return await this.userSubcriptionRepository.save(newUserSubcription);
  }

  async getUserSubscriptions(
    account_id: string,
    plan_id: string,
  ): Promise<UserSubscriptionsEntity | null> {
    return await this.userSubcriptionRepository.findOne({
      where: { account_id: account_id, plan_id: plan_id },
    });
  }

  async updateUserSubcription(
    userSubcription: UpdatedSubcriptionDto,
  ): Promise<UpdateResult> {
    const { account_id, plan_id, start_date, end_date } = userSubcription;
    // get userSubscription
    const userSub = await this.getUserSubscriptions(account_id, plan_id);
    if (!userSub) {
      throw new NotFoundException('User subscription not found');
    }
    //update userSubscription
    const updatedUserSub = await this.userSubcriptionRepository.update(
      { plan_id: plan_id, account_id: account_id },
      {
        start_date: start_date,
        end_date: end_date,
      },
    );
    if (updatedUserSub.affected === 0) {
      throw new NotFoundException('Nothing updated');
    }
    return updatedUserSub;
  }
}
