import { IsEnum, IsNumber } from 'class-validator';
import { ConnectorType } from 'src/enums/connector.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateChargePointDto {
  @ApiProperty({
    description: 'Type of charging connector',
    example: 'TYPE2',
    enum: ConnectorType,
    required: false,
  })
  @IsEnum(ConnectorType)
  connector_type?: ConnectorType;

  @ApiProperty({
    description: 'Maximum power output in kilowatts',
    example: 150,
    required: false,
  })
  @IsNumber()
  max_power_kw?: number;

  @ApiProperty({
    description: 'Price per kilowatt-hour in VND',
    example: 3500,
    required: false,
  })
  @IsNumber()
  price_per_kwh?: number;
}
