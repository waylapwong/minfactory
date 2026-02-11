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
import { Namespace } from '../../../shared/enums/namespace.enum';
import { MinRpsEvent } from '../models/enums/minrps-event.enum';
import { MinRpsConnectedPayload } from '../models/payloads/minrps-connected.payload';
import { MinRpsDisconnectedPayload } from '../models/payloads/minrps-disconnected.payload';
import type { MinRpsJoinPayload } from '../models/payloads/minrps-join.payload';
import { MinRpsJoinedPayload } from '../models/payloads/minrps-joined.payload';
import type { MinRpsLeavePayload } from '../models/payloads/minrps-leave.payload';
import { MinRpsLeftPayload } from '../models/payloads/minrps-left.payload';
import { MinRpsMultiplayerService } from '../services/minrps-multiplayer.service';
import { Acknowledgement } from 'src/shared/objects/acknowledgement';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: Namespace.MinRps,
})
export class MinRpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  constructor(private readonly multiplayerService: MinRpsMultiplayerService) {}

  @SubscribeMessage(MinRpsEvent.Join)
  public handleJoinEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() joinPayload: MinRpsJoinPayload,
  ): Acknowledgement {
    console.log(`Player joined: ${client.id}`, joinPayload);
    const joinedPayload: MinRpsJoinedPayload = this.multiplayerService.joinGame(
      client,
      joinPayload,
    );
    this.sendRoomEvent(joinPayload.gameId, MinRpsEvent.Joined, joinedPayload);
    return this.getAcknowledgement(true);
  }

  @SubscribeMessage(MinRpsEvent.Leave)
  public handleLeaveEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() leavePayload: MinRpsLeavePayload,
  ): Acknowledgement {
    console.log(`Player left: ${client.id}`, leavePayload);
    const leftPayload: MinRpsLeftPayload = this.multiplayerService.leaveGame(client, leavePayload);
    this.sendRoomEvent(leavePayload.gameId, MinRpsEvent.Left, leftPayload);
    return this.getAcknowledgement(true);
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

  private getAcknowledgement(isSuccess: boolean, message: string = 'OK'): Acknowledgement {
    const ack: Acknowledgement = new Acknowledgement();
    ack.isSuccess = isSuccess;
    ack.message = message;
    return ack;
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
