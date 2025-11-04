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
import { MinRpsDisconnectedEvent } from '../models/events/minrps-disconnected.event';
import type { MinRpsJoinEvent } from '../models/events/minrps-join.event';
import { MinRpsJoinedEvent } from '../models/events/minrps-joined.event';
import { MinRpsMatchService } from '../services/minrps-match.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: MinRpsNamespace.MinRps,
})
export class MinRpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  constructor(private readonly matchService: MinRpsMatchService) {}

  @SubscribeMessage(MinRpsEvent.Join)
  public handleJoinEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() joinEvent: MinRpsJoinEvent,
  ) {
    console.log(`${MinRpsEvent.Join} event received`, joinEvent);
    this.joinRoom(joinEvent.matchId, client);
    this.sendJoinedEvent(joinEvent.playerId, joinEvent.matchId);
  }

  public handleConnection(client: Socket): void {
    console.log(`Player connected: ${client.id}`);
    this.sendConnectedEvent(client);
  }

  public handleDisconnect(client: Socket): void {
    console.log(`Player disconnected: ${client.id}`);
    this.sendDisconnectedEvent(client.id);
  }

  private joinRoom(room: string, client: Socket): void {
    client.join(room);
    console.log(`Client ${client.id} joined room ${room}`);
  }

  private sendConnectedEvent(client: Socket): void {
    const connectedEvent: MinRpsConnectedEvent = { playerId: client.id };
    console.log(`${MinRpsEvent.Connected} event sent`, connectedEvent);
    client.emit(MinRpsEvent.Connected, connectedEvent);
  }

  private sendDisconnectedEvent(playerId: string): void {
    const disconnectedEvent: MinRpsDisconnectedEvent = { playerId };
    console.log(`${MinRpsEvent.Disconnected} event sent`, disconnectedEvent);
    this.server.emit(MinRpsEvent.Disconnected, disconnectedEvent);
  }

  private sendJoinedEvent(playerId: string, room: string): void {
    const joinedEvent: MinRpsJoinedEvent = { playerId };
    console.log(`${MinRpsEvent.Joined} event sent`, joinedEvent);
    this.server.to(room).emit(MinRpsEvent.Joined, joinedEvent);
  }
}
