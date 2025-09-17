import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ConnectorType } from 'src/enums/connector.enum';

export class CreateChargePointDto {
  @IsEnum(ConnectorType)
  @IsNotEmpty()
  connector_type: ConnectorType;

  @IsNumber()
  @IsNotEmpty()
  max_power_kw: number;

  @IsNumber()
  @IsNotEmpty()
  price_per_kwh: number;

  @IsString()
  @IsNotEmpty()
  station_id: string;
}
