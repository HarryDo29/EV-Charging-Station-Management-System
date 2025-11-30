import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class EndChargingSessionDto {
  @IsUUID()
  @IsNotEmpty()
  charging_session_id: string;

  @IsString()
  @IsNotEmpty()
  end_time: string;
}
