import { Module } from '@nestjs/common';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [QueueModule],
  providers: [],
  exports: [CronModule],
})
export class CronModule {}
