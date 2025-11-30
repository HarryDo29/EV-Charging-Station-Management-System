import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class EndChargingDto {
  @IsUUID()
  @IsNotEmpty()
  charge_point_id: string;

  @IsString()
  @IsNotEmpty()
  end_time: string;
}
