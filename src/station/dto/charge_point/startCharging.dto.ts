import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class StartChargingDto {
  @IsString()
  @IsNotEmpty()
  charge_point_id: string;

  @IsDate()
  @IsNotEmpty()
  start_time: Date;
}
