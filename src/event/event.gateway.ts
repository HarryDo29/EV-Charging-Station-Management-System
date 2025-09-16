import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  // Hàm này sẽ được gọi từ PaymentController để phát sự kiện
  sendPaymentStatus(orderCode: number, status: string, message: string) {
    const eventName = `payment_status:${orderCode}`;
    this.server.emit(eventName, { status, message });
  }
}
