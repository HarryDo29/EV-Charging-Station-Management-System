import { IsDate, IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateReservationDto {
  @IsDateString()
  @IsNotEmpty()
  reservation_day: string; // format: YYYY-MM-DD

  @IsDate()
  @IsNotEmpty()
  start_time: Date;

  @IsDate()
  @IsNotEmpty()
  end_time: Date;

  @IsUUID()
  @IsNotEmpty()
  charge_point_id: string;
}
