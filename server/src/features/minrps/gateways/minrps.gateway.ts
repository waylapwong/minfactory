import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
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
export class MinRPSGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  public server: Server;

  @SubscribeMessage('events')
  public handleEvent(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
    this.server.emit('events', data);
  }

  public afterInit(server: any) {
    console.log('Socket is live');
  }

  public handleConnection(client: any, ...args: any[]) {
    console.log('User connected');
  }

  public handleDisconnect(client: any) {
    console.log('User disconnected');
  }
}
