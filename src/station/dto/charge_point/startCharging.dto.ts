import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class StartChargingDto {
  @IsUUID()
  @IsNotEmpty()
  charge_point_id: string;

  @IsString()
  @IsNotEmpty()
  day: string;

  @IsDate()
  @IsNotEmpty()
  start_time: Date;
}
