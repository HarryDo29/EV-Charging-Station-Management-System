import { IsDate, IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateChargingSessionDto {
  @IsUUID()
  @IsNotEmpty()
  reservation_id: string;

  @IsDateString()
  @IsNotEmpty()
  day: string; // format: YYYY-MM-DD

  @IsDate()
  @IsNotEmpty()
  start_time: Date;

  //   @IsNumber()
  //   @IsNotEmpty()
  //   energy_consumed_kwh: number;

  //   @IsNumber()
  //   @IsNotEmpty()
  //   total_price: number;
}
