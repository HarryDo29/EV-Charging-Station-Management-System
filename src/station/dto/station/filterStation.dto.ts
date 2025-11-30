import { PartialType } from '@nestjs/mapped-types';
import { CreateStationDto } from './createStation.dto';

export class FilterStationDto extends PartialType(CreateStationDto) {}
