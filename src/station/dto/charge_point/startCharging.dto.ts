import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class StartChargingDto {
  @IsUUID()
  @IsNotEmpty()
  charge_point_id: string;

  @IsString()
  @IsNotEmpty()
  day: string;

  @IsString()
  @IsNotEmpty()
  start_time: string;
}
