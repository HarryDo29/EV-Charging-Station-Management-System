import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateChargingSessionDto {
  @IsUUID()
  @IsNotEmpty()
  reservation_id: string;

  @IsDateString()
  @IsNotEmpty()
  day: string; // format: YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  start_time: string;

  //   @IsNumber()
  //   @IsNotEmpty()
  //   energy_consumed_kwh: number;

  //   @IsNumber()
  //   @IsNotEmpty()
  //   total_price: number;
}
