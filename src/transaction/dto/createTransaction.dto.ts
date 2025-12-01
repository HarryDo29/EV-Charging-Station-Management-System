import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TransactionMethod } from 'src/enums/transactionMethod.enum';
import { TransactionType } from 'src/enums/transactionType.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Transaction amount in VND',
    example: 250000,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Payment method used for the transaction',
    example: 'CREDIT_CARD',
    enum: TransactionMethod,
    required: false,
  })
  @IsEnum(TransactionMethod)
  @IsOptional()
  method?: TransactionMethod;

  @ApiProperty({
    description: 'Type of transaction',
    example: 'PAYMENT',
    enum: TransactionType,
  })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Associated order ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  order_id: string;
}
