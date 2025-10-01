import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ReservationService } from '../station/reservation.service';

@Processor('reservation-expired-queue')
export class ExpiredReservationWorker extends WorkerHost {
  constructor(private readonly reservationService: ReservationService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    console.log('Expired reservation job', job.data);
    const { remindArray, expiredArray } =
      await this.reservationService.getExpiredReservation();
    console.log('Remind array', remindArray);
    console.log('Expired array', expiredArray);
  }
}
