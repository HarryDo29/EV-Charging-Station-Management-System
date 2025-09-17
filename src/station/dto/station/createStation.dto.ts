import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsEnum,
  IsDecimal,
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

  @IsDecimal()
  @IsNotEmpty()
  latitude: number;

  @IsDecimal()
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
