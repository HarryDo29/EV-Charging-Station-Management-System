import { IsEnum, IsString } from 'class-validator';
import { ConnectorType } from 'src/enums/connector.enum';
import { ApiProperty } from '@nestjs/swagger';

export class SearchVehicleDto {
  @ApiProperty({
    description: 'Car manufacturer/brand to search for',
    example: 'Tesla',
    required: false,
  })
  @IsString()
  car_makes?: string;

  @ApiProperty({
    description: 'Type of charging connector',
    example: 'TYPE2',
    enum: ConnectorType,
    required: false,
  })
  @IsEnum(ConnectorType)
  connector_type?: ConnectorType;
}
