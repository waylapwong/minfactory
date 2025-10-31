import { MinRpsNamespace } from '../models/enums/minrps-namespace.enum';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: MinRpsNamespace.MinRps,
})
export class MinRpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  @SubscribeMessage('events')
  public handleEvent(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
    this.server.emit('events', data);
  }

  public handleConnection(client: Socket) {
    console.log(`Player connected: ${client.id}`);
  }

  public handleDisconnect(client: Socket) {
    console.log(`Player disconnected: ${client.id}`);
  }
}
