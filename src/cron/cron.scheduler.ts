import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CronScheduler {
  constructor(
    // Inject the queue
    @InjectQueue('reservation-expired-queue')
    private readonly expiredReserQueue: Queue,
  ) {}

  // Schedule the job to get reservation expired and reminded
  // Every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    await this.expiredReserQueue.add('reservation-expired-job', {
      message: 'get reservation expired and reminded every 5 minutes',
    });
  }
}
