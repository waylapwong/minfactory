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
import { MinRpsConnectedPayload } from '../models/payloads/minrps-connected.payload';
import { MinRpsDisconnectedPayload } from '../models/payloads/minrps-disconnected.payload';
import type { MinRpsJoinPayload } from '../models/payloads/minrps-join.payload';
import { MinRpsJoinedPayload } from '../models/payloads/minrps-joined.payload';
import type { MinRpsLeavePayload } from '../models/payloads/minrps-leave.payload';
import { MinRpsLeftPayload } from '../models/payloads/minrps-left.payload';
import { MinRpsMatchSystem } from '../systems/minrps-match.system';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: MinRpsNamespace.MinRps,
})
export class MinRpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  constructor(private readonly matchSystem: MinRpsMatchSystem) {}

  @SubscribeMessage(MinRpsEvent.Join)
  public handleJoinEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() requestPayload: MinRpsJoinPayload,
  ): void {
    console.log(`Player joined: ${client.id}`, requestPayload);
    const room: string = requestPayload.gameId;
    client.join(room);
    const responsePayload: MinRpsJoinedPayload = { player: client.id };
    this.sendRoomEvent(room, MinRpsEvent.Joined, responsePayload);
  }

  @SubscribeMessage(MinRpsEvent.Leave)
  public handleLeaveEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() leaveEvent: MinRpsLeavePayload,
  ): void {
    console.log(`Player left: ${client.id}`, leaveEvent);
    const room: string = leaveEvent.game;
    client.leave(room);
    const leftEvent: MinRpsLeftPayload = { player: client.id };
    this.sendRoomEvent(room, MinRpsEvent.Left, leftEvent);
  }

  public handleConnection(client: Socket): void {
    console.log(`Player connected: ${client.id}`);
    const connectedPayload: MinRpsConnectedPayload = { player: client.id };
    this.sendClientEvent(client, MinRpsEvent.Connected, connectedPayload);
  }

  public handleDisconnect(client: Socket): void {
    console.log(`Player disconnected: ${client.id}`);
    const disconnectedEvent: MinRpsDisconnectedPayload = { player: client.id };
    this.sendRoomEvent('', MinRpsEvent.Disconnected, disconnectedEvent);
  }

  private sendClientEvent(client: Socket, event: MinRpsEvent, payload: any): void {
    client.emit(event, payload);
    console.log(`${event} event sent`, payload);
  }

  private sendRoomEvent(room: string, event: MinRpsEvent, payload: any): void {
    console.log(`${event} event sent to room: ${room}`, payload);
    this.server.to(room).emit(event, payload);
  }
}
