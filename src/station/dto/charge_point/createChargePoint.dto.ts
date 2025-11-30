import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ConnectorType } from 'src/enums/connector.enum';
import { StationStatus } from 'src/enums/stationStatus.enum';

export class CreateChargePointDto {
  @IsEnum(ConnectorType)
  @IsNotEmpty()
  connector_type: ConnectorType;

  @IsString()
  @IsNotEmpty()
  identifer: string;

  @IsEnum(StationStatus)
  @IsNotEmpty()
  status: StationStatus;

  @IsNumber()
  @IsNotEmpty()
  maxPowerKw: number;

  @IsNumber()
  @IsNotEmpty()
  pricePerKwh: number;

  @IsNumber()
  @IsNotEmpty()
  parkingFeePerHour: number;
}
