import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { TransactionMethod } from 'src/enums/transactionMethod.enum';

export class CreateTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(TransactionMethod)
  @IsNotEmpty()
  method: TransactionMethod;
}
