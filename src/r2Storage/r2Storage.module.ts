import { Module } from '@nestjs/common';
import { R2StorageService } from './r2Storage.service';
import { R2StorageController } from './r2Storage.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [R2StorageController],
  providers: [R2StorageService],
  exports: [R2StorageService],
})
export class R2StorageModule {}
