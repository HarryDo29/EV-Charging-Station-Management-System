import { Module } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleEntity } from './entity/vehicle.entity';
import { AccountEntity } from 'src/account/entity/account.entity';
import { AccountModule } from 'src/account/account.module';
import { AccountService } from 'src/account/account.service';
import { Argon2Service } from 'src/argon2/argon2.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VehicleEntity, AccountEntity]),
    AccountModule,
  ],
  providers: [VehicleService, AccountService, Argon2Service],
  exports: [VehicleService],
  controllers: [VehicleController],
})
export class VehicleModule {}
