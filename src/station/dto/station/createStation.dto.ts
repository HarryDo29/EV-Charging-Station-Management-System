import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsEnum,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { ConnectorType } from 'src/enums/connector.enum';

export class CreateStationDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsLatitude()
  @IsNotEmpty()
  latitude: number;

  @IsLongitude()
  @IsNotEmpty()
  longitude: number;

  @IsArray()
  @IsEnum(ConnectorType, { each: true })
  @IsNotEmpty()
  connectorTypes: ConnectorType[];

  @IsNumber()
  powerKw?: number;

  @IsNumber()
  pricePerKwh?: number;

  @IsNumber()
  totalPorts?: number;

  @IsNumber()
  availablePorts?: number;
}
