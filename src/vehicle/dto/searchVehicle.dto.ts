import { IsEnum, IsString } from 'class-validator';
import { ConnectorType } from 'src/enums/connector.enum';

export class SearchVehicleDto {
  @IsString()
  car_makes?: string;

  @IsEnum(ConnectorType)
  connector_type?: ConnectorType;
}
