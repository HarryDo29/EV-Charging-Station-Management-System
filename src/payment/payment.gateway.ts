import {
  SubscribeMessage,
  ConnectedSocket,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true,
  },
  transports: ['websocket'],
  path: '/socket-io/payment',
})
export class PaymentGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket server initialized', server);
  }

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
    payload: { orderId: string },
  ) {
    const roomName = `payment_room:${payload.orderId}`;
    await client.join(roomName);
    console.log(`Client ${client.id} joined room ${roomName}`);
  }

  public sendPaymentStatus(orderId: string, status: 'SUCCESS' | 'FAILED') {
    const roomName = `payment_room:${orderId}`;

    // Gửi event 'payment_status' tới TẤT CẢ client đang ở trong room
    this.server.to(roomName).emit('payment_status', {
      orderId: orderId,
      status: status,
    });

    console.log(`Đã gửi payment_status [${status}] tới phòng ${roomName}`);
  }
}
