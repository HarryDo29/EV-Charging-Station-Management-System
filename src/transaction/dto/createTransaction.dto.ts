import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TransactionMethod } from 'src/enums/transactionMethod.enum';
import { TransactionType } from 'src/enums/transactionType.enum';

export class CreateTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(TransactionMethod)
  @IsOptional()
  method?: TransactionMethod;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  order_id: string;
}
