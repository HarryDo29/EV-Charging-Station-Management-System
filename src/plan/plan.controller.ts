import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { Roles } from 'src/auth/decorator/role.decorator';
import { Role } from 'src/enums/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { CreatedPlanDto } from './dto/plan/createdPlan.dto';
import { CreatedSubcriptionDto } from './dto/user_subcription/createdSubcription.dto';
import { UserSubcriptionService } from './user_subcription.service';
import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';
import type { Request as RequestExpress } from 'express';
import { UpdatedSubcriptionDto } from './dto/user_subcription/updatesubcription.dto';

@Controller('plan')
export class PlanController {
  constructor(
    private readonly planService: PlanService,
    private readonly userSubcriptionService: UserSubcriptionService,
  ) {}

  //______________________________________________PLAN_____________________________________________
  @Post('/create-plan')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN)
  async createPlan(@Body() plan: CreatedPlanDto) {
    return await this.planService.createPlan(plan);
  }

  @Get('/get-all-plans')
  @UseGuards(AuthGuard('jwt'))
  // @Roles(Role.ADMIN)
  async getAllPlans() {
    return await this.planService.getPlans();
  }

  @Get('/get-plan-by-id/:id')
  @UseGuards(AuthGuard('jwt'))
  // @Roles(Role.ADMIN)
  async getPlanById(@Param('id') id: string) {
    return await this.planService.getPlanById(id);
  }

  //_______________________________________USER SUBSCRIPTION_______________________________________
  @Post('/create-user-subscription')
  @UseGuards(AuthGuard('jwt'))
  // @Roles(Role.ADMIN)
  async createUserSubscription(
    @Request() req: RequestExpress,
    @Body() userSubscription: CreatedSubcriptionDto,
  ) {
    const acc = req.user as AuthenticatedUserDto;
    userSubscription.account_id = acc.id;
    return await this.userSubcriptionService.createUserSubcription(
      userSubscription,
    );
  }

  @Get('/get-user-subscription-by-id/:plan_id')
  @UseGuards(AuthGuard('jwt'))
  // @Roles(Role.ADMIN)
  async getUserSubscriptionById(
    @Param('plan_id') plan_id: string,
    @Request() req: RequestExpress,
  ) {
    const acc = req.user as AuthenticatedUserDto;
    return await this.userSubcriptionService.getUserSubscriptions(
      acc.id,
      plan_id,
    );
  }

  @Put('/update-user-subscription')
  @UseGuards(AuthGuard('jwt'))
  // @Roles(Role.ADMIN)
  async updateUserSubscription(
    @Request() req: RequestExpress,
    @Body() userSubscription: UpdatedSubcriptionDto,
  ) {
    const acc = req.user as AuthenticatedUserDto;
    userSubscription.account_id = acc.id;
    return await this.userSubcriptionService.updateUserSubcription(
      userSubscription,
    );
  }
}
