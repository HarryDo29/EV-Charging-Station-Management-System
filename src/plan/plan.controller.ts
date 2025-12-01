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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
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

@ApiTags('Plan & Subscription')
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new subscription plan (Admin only)' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid plan data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async createPlan(@Body() plan: CreatedPlanDto) {
    return await this.planService.createPlan(plan);
  }

  @Get('/get-all-plans')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all available subscription plans' })
  @ApiResponse({
    status: 200,
    description: 'List of plans retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllPlans() {
    return await this.planService.getPlans();
  }

  @Get('/get-plan-by-id/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get plan details by ID' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({
    status: 200,
    description: 'Plan details retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async getPlanById(@Param('id') id: string) {
    return await this.planService.getPlanById(id);
  }

  //_______________________________________USER SUBSCRIPTION_______________________________________
  @Post('/create-user-subscription')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a user subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid subscription data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user subscription by plan ID' })
  @ApiParam({ name: 'plan_id', description: 'Plan ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription details retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid subscription data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
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
