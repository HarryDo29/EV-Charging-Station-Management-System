import {
  IsEnum,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { BillingCycle } from 'src/enums/billingCycle.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreatedPlanDto {
  @ApiProperty({
    description: 'Name of the subscription plan',
    example: 'Premium Plan',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the subscription plan',
    example: 'Unlimited charging with premium features',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Price of the plan in VND',
    example: 299000,
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'Billing cycle for the plan',
    example: 'MONTHLY',
    enum: BillingCycle,
  })
  @IsEnum(BillingCycle)
  @IsNotEmpty()
  billing_cycle: BillingCycle;

  @ApiProperty({
    description: 'JSON string containing plan benefits',
    example: '{"discount": "20%", "priority_booking": true}',
  })
  @IsString()
  @IsNotEmpty()
  @IsJSON()
  benefits: string;
}
