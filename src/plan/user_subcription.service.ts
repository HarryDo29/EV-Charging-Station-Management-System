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
    accountId: string,
    planId: string,
  ): Promise<UserSubscriptionsEntity> {
    const userSub = await this.getUserSubscriptions(accountId, planId);
    if (userSub) {
      throw new NotFoundException('User subscription already exists');
    }
    const newUserSubcription = this.userSubcriptionRepository.create({
      ...userSubcription,
      account_id: accountId,
      plan_id: planId,
    });
    return await this.userSubcriptionRepository.save(newUserSubcription);
  }

  async getUserSubscriptions(
    accountId: string,
    planId: string,
  ): Promise<UserSubscriptionsEntity | null> {
    return await this.userSubcriptionRepository.findOne({
      where: { account_id: accountId, plan_id: planId },
    });
  }

  async updateUserSubcription(
    userSubcription: UpdatedSubcriptionDto,
    accountId: string,
    planId: string,
  ): Promise<UpdateResult> {
    const userSub = await this.getUserSubscriptions(accountId, planId);
    if (!userSub) {
      throw new NotFoundException('User subscription not found');
    }
    const updatedUserSub = await this.userSubcriptionRepository.update(
      { plan_id: planId, account_id: accountId },
      {
        ...userSubcription,
      },
    );
    if (updatedUserSub.affected === 0) {
      throw new NotFoundException('Nothing updated');
    }
    return updatedUserSub;
  }
}
