import { Module } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleEntity } from './entity/vehicle.entity';
import { AccountEntity } from 'src/account/entity/account.entity';
import { AccountService } from 'src/account/account.service';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleEntity, AccountEntity])],
  providers: [VehicleService, AccountService],
  exports: [VehicleService],
  controllers: [VehicleController],
})
export class VehicleModule {}
