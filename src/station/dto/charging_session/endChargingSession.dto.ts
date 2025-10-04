import { IsDate, IsNotEmpty, IsUUID } from 'class-validator';

export class EndChargingSessionDto {
  @IsUUID()
  @IsNotEmpty()
  charging_session_id: string;

  @IsDate()
  @IsNotEmpty()
  end_time: Date;
}
