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
import type { MinRpsLeaveEvent } from '../models/events/minrps-leave.event';
import { MinRpsLeftEvent } from '../models/events/minrps-left.event';
import { MinRpsMatchSystem } from '../systems/minrps-match.system';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: MinRpsNamespace.MinRps,
})
export class MinRpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  constructor(private readonly matchService: MinRpsMatchSystem) {}

  @SubscribeMessage(MinRpsEvent.Join)
  public handleJoinEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() joinEvent: MinRpsJoinEvent,
  ): void {
    console.log(`Player joined: ${client.id}`, joinEvent);
    const room: string = joinEvent.game;
    client.join(room);
    const joinedEvent: MinRpsJoinedEvent = { player: client.id };
    this.sendRoomEvent(room, MinRpsEvent.Joined, joinedEvent);
  }

  @SubscribeMessage(MinRpsEvent.Leave)
  public handleLeaveEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() leaveEvent: MinRpsLeaveEvent,
  ): void {
    console.log(`Player left: ${client.id}`, leaveEvent);
    const room: string = leaveEvent.game;
    client.leave(room);
    const leftEvent: MinRpsLeftEvent = { player: client.id };
    this.sendRoomEvent(room, MinRpsEvent.Left, leftEvent);
  }

  public handleConnection(client: Socket): void {
    console.log(`Player connected: ${client.id}`);
    const connectedEvent: MinRpsConnectedEvent = { player: client.id };
    this.sendClientEvent(client, MinRpsEvent.Connected, connectedEvent);
  }

  public handleDisconnect(client: Socket): void {
    console.log(`Player disconnected: ${client.id}`);
    const disconnectedEvent: MinRpsDisconnectedEvent = { player: client.id };
    this.sendRoomEvent('', MinRpsEvent.Disconnected, disconnectedEvent);
  }

  private sendClientEvent(client: Socket, event: MinRpsEvent, data: any): void {
    client.emit(event, data);
    console.log(`${event} event sent`, data);
  }

  private sendRoomEvent(room: string, event: MinRpsEvent, data: any): void {
    console.log(`${event} event sent to room: ${room}`, data);
    this.server.to(room).emit(event, data);
  }
}
