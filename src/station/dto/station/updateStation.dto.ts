import {
  IsArray,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ConnectorType } from 'src/enums/connector.enum';

export class UpdateStationDto {
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsDecimal()
  @IsNotEmpty()
  latitude?: number;

  @IsDecimal()
  @IsNotEmpty()
  longitude?: number;

  @IsArray()
  @IsEnum(ConnectorType, { each: true })
  @IsNotEmpty()
  connectorTypes?: ConnectorType[];

  @IsNumber()
  @IsNotEmpty()
  powerKw?: number;

  @IsNumber()
  @IsNotEmpty()
  pricePerKwh?: number;

  @IsNumber()
  @IsNotEmpty()
  totalPorts?: number;

  @IsNumber()
  @IsNotEmpty()
  availablePorts?: number;
}
