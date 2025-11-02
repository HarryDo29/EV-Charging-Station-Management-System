import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateReservationDto {
  @IsDateString()
  @IsNotEmpty()
  reservation_day: string; // format: YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  start_time: string;

  @IsString()
  @IsNotEmpty()
  end_time: string;

  @IsUUID()
  @IsNotEmpty()
  charge_point_id: string;

  @IsUUID()
  @IsNotEmpty()
  vehicle_id: string;
}
