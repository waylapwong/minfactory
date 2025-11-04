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
import { MinRpsEvent } from '../models/enums/minrps-event.enum';
import { MinRpsNamespace } from '../models/enums/minrps-namespace.enum';
import { MinRpsConnectedEvent } from '../models/events/minrps-connected.event';
import { MinRpsMatchService } from '../services/minrps-match.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: MinRpsNamespace.MinRps,
})
export class MinRpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  constructor(private readonly matchService: MinRpsMatchService) {}

  @SubscribeMessage('events')
  public handleEvent(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
    this.server.emit('events', data);
  }

  public handleConnection(client: Socket): void {
    console.log(`Player connected: ${client.id}`);
    this.sendConnectedEvent(client);
  }

  public handleDisconnect(client: Socket): void {
    console.log(`Player disconnected: ${client.id}`);
  }

  private sendConnectedEvent(client: Socket): void {
    const event: MinRpsConnectedEvent = { playerId: client.id };
    client.emit(MinRpsEvent.Connected, event);
  }
}
