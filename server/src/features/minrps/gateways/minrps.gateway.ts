import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { MinRPSNamespace } from '../models/enums/minrps-namespace.enum';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: MinRPSNamespace.MinRPS,
})
export class MinRPSGateway implements OnGatewayConnection, OnGatewayDisconnect {
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
