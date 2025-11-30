import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanEntity } from './entity/plan.entity';
import { CreatedPlanDto } from './dto/plan/createdPlan.dto';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(PlanEntity)
    private readonly planRepo: Repository<PlanEntity>,
  ) {}

  // create plan
  async createPlan(plan: CreatedPlanDto): Promise<PlanEntity> {
    const nPlan = this.planRepo.create({
      ...plan,
      benefits: JSON.parse(plan.benefits) as JSON,
    });
    return await this.planRepo.save(nPlan);
  }

  // get plans
  async getPlans(): Promise<PlanEntity[]> {
    return await this.planRepo.find();
  }

  // get plan by id
  async getPlanById(id: string): Promise<PlanEntity | null> {
    return await this.planRepo.findOne({ where: { id } });
  }
}
