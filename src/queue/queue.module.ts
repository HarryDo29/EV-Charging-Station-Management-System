import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

@Module({
  imports: [BullModule.registerQueue({ name: 'reservation-expired-queue' })],
  controllers: [],
  providers: [],
  exports: [QueueModule],
})
export class QueueModule {}
