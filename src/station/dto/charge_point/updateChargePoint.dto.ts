import { IsEnum, IsNumber } from 'class-validator';
import { ConnectorType } from 'src/enums/connector.enum';

export class UpdateChargePointDto {
  @IsEnum(ConnectorType)
  connector_type?: ConnectorType;

  @IsNumber()
  max_power_kw?: number;

  @IsNumber()
  price_per_kwh?: number;
}
