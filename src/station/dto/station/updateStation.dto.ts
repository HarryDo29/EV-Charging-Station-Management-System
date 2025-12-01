import {
  IsArray,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ConnectorType } from 'src/enums/connector.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStationDto {
  @ApiProperty({
    description: 'Name of the charging station',
    example: 'Vincom Center Station',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    description: 'Physical address of the station',
    example: '123 Le Loi Street, District 1, Ho Chi Minh City',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  address?: string;

  @ApiProperty({
    description: 'Latitude coordinate of the station',
    example: 10.762622,
    required: false,
  })
  @IsDecimal()
  @IsNotEmpty()
  latitude?: number;

  @ApiProperty({
    description: 'Longitude coordinate of the station',
    example: 106.660172,
    required: false,
  })
  @IsDecimal()
  @IsNotEmpty()
  longitude?: number;

  @ApiProperty({
    description: 'List of connector types available at the station',
    example: ['TYPE2', 'CHADEMO'],
    enum: ConnectorType,
    isArray: true,
    required: false,
  })
  @IsArray()
  @IsEnum(ConnectorType, { each: true })
  @IsNotEmpty()
  connectorTypes?: ConnectorType[];

  @ApiProperty({
    description: 'Maximum power output in kilowatts',
    example: 150,
    required: false,
  })
  @IsNumber()
  @IsNotEmpty()
  powerKw?: number;

  @ApiProperty({
    description: 'Price per kilowatt-hour in VND',
    example: 3500,
    required: false,
  })
  @IsNumber()
  @IsNotEmpty()
  pricePerKwh?: number;

  @ApiProperty({
    description: 'Total number of charging ports',
    example: 10,
    required: false,
  })
  @IsNumber()
  @IsNotEmpty()
  totalPorts?: number;

  @ApiProperty({
    description: 'Number of available charging ports',
    example: 7,
    required: false,
  })
  @IsNumber()
  @IsNotEmpty()
  availablePorts?: number;
}
