import {
  IsEnum,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { BillingCycle } from 'src/enums/billingCycle.enum';

export class CreatedPlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsEnum(BillingCycle)
  @IsNotEmpty()
  billing_cycle: BillingCycle;

  @IsString()
  @IsNotEmpty()
  @IsJSON()
  benefits: string;
}
