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
import { ApiProperty } from '@nestjs/swagger';

export class CreateStationDto {
  @ApiProperty({
    description: 'Unique identifier for the station',
    example: 'STATION-HCM-001',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    description: 'Name of the charging station',
    example: 'Vincom Center Station',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Physical address of the station',
    example: '123 Le Loi Street, District 1, Ho Chi Minh City',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Latitude coordinate of the station',
    example: 10.762622,
  })
  @IsLatitude()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate of the station',
    example: 106.660172,
  })
  @IsLongitude()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({
    description: 'List of connector types available at the station',
    example: ['TYPE2', 'CHADEMO'],
    enum: ConnectorType,
    isArray: true,
  })
  @IsArray()
  @IsEnum(ConnectorType, { each: true })
  @IsNotEmpty()
  connectorTypes: ConnectorType[];

  @ApiProperty({
    description: 'Maximum power output in kilowatts',
    example: 150,
    required: false,
  })
  @IsNumber()
  powerKw?: number;

  @ApiProperty({
    description: 'Price per kilowatt-hour in VND',
    example: 3500,
    required: false,
  })
  @IsNumber()
  pricePerKwh?: number;

  @ApiProperty({
    description: 'Total number of charging ports',
    example: 10,
    required: false,
  })
  @IsNumber()
  totalPorts?: number;

  @ApiProperty({
    description: 'Number of available charging ports',
    example: 10,
    required: false,
  })
  @IsNumber()
  availablePorts?: number;
}
