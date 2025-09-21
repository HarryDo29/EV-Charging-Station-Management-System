import { IsDate, IsNotEmpty } from 'class-validator';

export class UpdatedSubcriptionDto {
  @IsDate()
  @IsNotEmpty()
  start_date: Date;

  @IsDate()
  @IsNotEmpty()
  end_date: Date;
}
