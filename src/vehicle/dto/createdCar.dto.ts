import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ConnectorType } from 'src/enums/connector.enum';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  car_maker: string;

  @IsString()
  @IsNotEmpty()
  models: string;

  @IsString()
  @IsNotEmpty()
  license_plate: string;

  @IsEnum(ConnectorType)
  @IsNotEmpty()
  connector_type: ConnectorType;

  @IsNumber()
  @IsNotEmpty()
  battery_capacity_kwh: number;

  @IsNumber()
  @IsNotEmpty()
  charging_power_kw: number;

  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
