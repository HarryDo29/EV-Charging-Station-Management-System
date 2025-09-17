import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationController } from './station.controller';
import { StationService } from './station.service';
import { StationEntity } from './entity/station.entity';
import { ChargePointEntity } from './entity/charge_point.entity';
import { ChargePointService } from './charge_point.service';

@Module({
  imports: [TypeOrmModule.forFeature([StationEntity, ChargePointEntity])],
  controllers: [StationController],
  providers: [StationService, ChargePointService],
  exports: [StationService, ChargePointService],
})
export class StationModule {}
