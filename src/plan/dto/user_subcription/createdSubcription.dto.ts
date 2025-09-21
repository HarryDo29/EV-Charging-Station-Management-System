import { IsDate, IsNotEmpty } from 'class-validator';

export class CreatedSubcriptionDto {
  @IsDate()
  @IsNotEmpty()
  start_date: Date;

  @IsDate()
  @IsNotEmpty()
  end_date: Date;
}
