import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { TransactionMethod } from 'src/enums/transactionMethod.enum';

export class CreateTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(TransactionMethod)
  @IsOptional()
  // @IsNotEmpty()
  method?: TransactionMethod;
}
