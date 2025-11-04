import {
  SubscribeMessage,
  ConnectedSocket,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
})
export class PaymentGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client connected', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected', client.id);
  }

  @SubscribeMessage('joinPaymentRoom')
  async handleJoinPaymentRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { orderCode: number },
  ) {
    const room = await client.join(`payment_room:${payload.orderCode}`);
    console.log('Client joined room', room);
  }

  public sendPaymentStatus(orderId: string, status: 'SUCCESS' | 'FAILED') {
    // Gửi event 'payment_status' tới TẤT CẢ client
    // đang ở trong phòng có tên là `orderId`
    this.server.to(orderId).emit('payment_status', {
      orderId: orderId,
      status: status,
    });

    console.log(`Đã gửi status ${status} tới phòng ${orderId}`);
  }
}
