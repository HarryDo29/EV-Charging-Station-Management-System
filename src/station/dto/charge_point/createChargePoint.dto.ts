import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ConnectorType } from 'src/enums/connector.enum';
import { StationStatus } from 'src/enums/stationStatus.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChargePointDto {
  @ApiProperty({
    description: 'Type of charging connector',
    example: 'TYPE2',
    enum: ConnectorType,
  })
  @IsEnum(ConnectorType)
  @IsNotEmpty()
  connector_type: ConnectorType;

  @ApiProperty({
    description: 'Unique identifier for the charge point',
    example: 'CP-001',
  })
  @IsString()
  @IsNotEmpty()
  identifer: string;

  @ApiProperty({
    description: 'Current status of the charge point',
    example: 'AVAILABLE',
    enum: StationStatus,
  })
  @IsEnum(StationStatus)
  @IsNotEmpty()
  status: StationStatus;

  @ApiProperty({
    description: 'Maximum power output in kilowatts',
    example: 150,
  })
  @IsNumber()
  @IsNotEmpty()
  maxPowerKw: number;

  @ApiProperty({
    description: 'Price per kilowatt-hour in VND',
    example: 3500,
  })
  @IsNumber()
  @IsNotEmpty()
  pricePerKwh: number;

  @ApiProperty({
    description: 'Parking fee per hour in VND',
    example: 10000,
  })
  @IsNumber()
  @IsNotEmpty()
  parkingFeePerHour: number;
}
