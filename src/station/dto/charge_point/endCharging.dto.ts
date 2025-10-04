import { IsDate, IsNotEmpty, IsUUID } from 'class-validator';

export class EndChargingDto {
  @IsUUID()
  @IsNotEmpty()
  charge_point_id: string;

  @IsDate()
  @IsNotEmpty()
  end_time: Date;
}
