import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ConnectorType } from 'src/enums/connector.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Car manufacturer/brand name',
    example: 'Tesla',
  })
  @IsString()
  @IsNotEmpty()
  car_maker: string;

  @ApiProperty({
    description: 'Vehicle model name',
    example: 'Model 3',
  })
  @IsString()
  @IsNotEmpty()
  models: string;

  @ApiProperty({
    description: 'Vehicle license plate number',
    example: '29A-12345',
  })
  @IsString()
  @IsNotEmpty()
  license_plate: string;

  @ApiProperty({
    description: 'Type of charging connector compatible with the vehicle',
    example: 'TYPE2',
    enum: ConnectorType,
  })
  @IsEnum(ConnectorType)
  @IsNotEmpty()
  connector_type: ConnectorType;

  @ApiProperty({
    description: 'Battery capacity in kilowatt-hours',
    example: 75.5,
  })
  @IsNumber()
  @IsNotEmpty()
  battery_capacity_kwh: number;

  @ApiProperty({
    description: 'Maximum charging power in kilowatts',
    example: 150,
  })
  @IsNumber()
  @IsNotEmpty()
  charging_power_kw: number;

  @ApiProperty({
    description: 'Whether the vehicle is active/available',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
