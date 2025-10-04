import { IsDate, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdatedSubcriptionDto {
  @IsUUID()
  @IsNotEmpty()
  account_id: string;

  @IsUUID()
  @IsNotEmpty()
  plan_id: string;

  @IsDate()
  @IsNotEmpty()
  start_date: Date;

  @IsDate()
  @IsNotEmpty()
  end_date: Date;
}
