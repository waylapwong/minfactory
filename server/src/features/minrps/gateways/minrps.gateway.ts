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
import { MinRpsGameEvent } from '../models/enums/minrps-game-event.enum';
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

  @SubscribeMessage(MinRpsGameEvent.Join)
  public handleJoinEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() joinPayload: MinRpsJoinPayload,
  ): Acknowledgement {
    console.log(
      `Player: ${joinPayload.playerId} wants to join game: ${joinPayload.gameId}`,
      joinPayload,
    );
    const joinedPayload: MinRpsJoinedPayload = this.multiplayerService.joinGame(
      client,
      joinPayload,
    );
    this.sendRoomEvent(joinedPayload.gameId, MinRpsGameEvent.Joined, joinedPayload);
    return new Acknowledgement();
  }

  @SubscribeMessage(MinRpsGameEvent.Leave)
  public handleLeaveEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() leavePayload: MinRpsLeavePayload,
  ): Acknowledgement {
    console.log(`Player: ${leavePayload.playerId} left game: ${leavePayload.gameId}`, leavePayload);
    const leftPayload: MinRpsLeftPayload = this.multiplayerService.leaveGame(client, leavePayload);
    this.sendRoomEvent(leavePayload.gameId, MinRpsGameEvent.Left, leftPayload);
    return new Acknowledgement();
  }

  public handleConnection(client: Socket): void {
    console.log(`Player connected: ${client.id}`);
    const connectedPayload: MinRpsConnectedPayload = new MinRpsConnectedPayload();
    connectedPayload.playerId = crypto.randomUUID();
    this.sendClientEvent(client, MinRpsGameEvent.Connected, connectedPayload);
  }

  public handleDisconnect(client: Socket): void {
    console.log(`Player disconnected: ${client.id}`);
    this.multiplayerService.removePlayerFromAllRooms(client);
    const roomNames: string[] = this.multiplayerService.getAllPlayerRoomNames(client);
    for (const roomName of roomNames) {
      const disconnectedPayload: MinRpsDisconnectedPayload = new MinRpsDisconnectedPayload();
      disconnectedPayload.gameId = roomName;
      disconnectedPayload.playerId = client.id;
      this.sendRoomEvent(roomName, MinRpsGameEvent.Disconnected, disconnectedPayload);
    }
  }

  private sendClientEvent(client: Socket, event: MinRpsGameEvent, payload: any): void {
    console.log(`Event: ${event} sent to player: ${payload.playerId}`, payload);
    client.emit(event, payload);
  }

  private sendRoomEvent(room: string, event: MinRpsGameEvent, payload: any): void {
    console.log(`Event: ${event} sent to room: ${room}`, payload);
    this.server.to(room).emit(event, payload);
  }
}
