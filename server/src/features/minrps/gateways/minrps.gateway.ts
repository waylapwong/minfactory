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
import { MinRpsMatchCommand } from '../models/enums/minrps-match-command.enum';
import { MinRpsMatchEvent } from '../models/enums/minrps-match-event.enum';
import { MinRpsMove } from '../models/enums/minrps-move.enum';
import { MinRpsMatchConnectedPayload } from '../models/payloads/minrps-match-connected.payload';
import { MinRpsMatchDisconnectedPayload } from '../models/payloads/minrps-match-disconnected.payload';
import type { MinRpsMatchJoinPayload } from '../models/payloads/minrps-match-join.payload';
import type { MinRpsMatchLeavePayload } from '../models/payloads/minrps-match-leave.payload';
import { MinRpsMatchPlayPayload } from '../models/payloads/minrps-match-play.payload';
import { MinRpsMatchUpdatedPayload } from '../models/payloads/minrps-match-updated.payload';
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

  @SubscribeMessage(MinRpsMatchCommand.Join)
  public handleJoinCommand(
    @ConnectedSocket() client: Socket,
    @MessageBody() command: MinRpsMatchJoinPayload,
  ): void {
    const event: MinRpsMatchUpdatedPayload = this.multiplayerService.joinMatch(client, command);
    this.sendMatchUpdatedEvent(event);
  }

  @SubscribeMessage(MinRpsMatchCommand.Leave)
  public handleLeaveCommand(
    @ConnectedSocket() client: Socket,
    @MessageBody() command: MinRpsMatchLeavePayload,
  ): void {
    const event: MinRpsMatchUpdatedPayload = this.multiplayerService.leaveMatch(client, command);
    this.sendMatchUpdatedEvent(event);
  }

  @SubscribeMessage(MinRpsMatchCommand.Play)
  public handlePlayCommand(
    @ConnectedSocket() client: Socket,
    @MessageBody() command: MinRpsMatchPlayPayload,
  ): void {
    const event: MinRpsMatchUpdatedPayload = this.multiplayerService.playMatch(command);
    if (event.player1Move !== MinRpsMove.None && event.player2Move !== MinRpsMove.None) {
      this.sendMatchUpdatedEvent(event);
    } else {
      this.sendClientEvent(client, MinRpsMatchEvent.Updated, event);
    }
  }

  @SubscribeMessage(MinRpsMatchEvent.TakeSeat)
  public handleTakeSeatEvent(
    @MessageBody() takeSeatPayload: MinRpsTakeSeatPayload,
  ): Acknowledgement {
    console.log(
      `Player: ${takeSeatPayload.playerId} wants seat ${takeSeatPayload.seat} in game: ${takeSeatPayload.gameId}`,
      takeSeatPayload,
    );
    const gameState: MinRpsMatchPlayPayload = this.multiplayerService.takeSeat(takeSeatPayload);
    this.sendRoomEvent(takeSeatPayload.gameId, MinRpsMatchEvent.GameStateUpdate, gameState);
    return new Acknowledgement();
  }

  public handleConnection(client: Socket): void {
    console.log(`Player connected: ${client.id}`);
    const connectedPayload: MinRpsMatchConnectedPayload = new MinRpsMatchConnectedPayload();
    connectedPayload.playerId = crypto.randomUUID();
    this.sendClientEvent(client, MinRpsMatchEvent.Connected, connectedPayload);
  }

  public handleDisconnect(client: Socket): void {
    console.log(`Player disconnected: ${client.id}`);
    const roomNames: string[] = this.multiplayerService.getAllPlayerRoomNames(client);
    const playerId: string | undefined = this.multiplayerService.getPlayerIdForSocket(client);
    this.multiplayerService.removePlayerFromAllRooms(client);
    if (playerId) {
      this.multiplayerService.removePlayerFromGames(roomNames, playerId);
    }
    this.multiplayerService.clearPlayerSocket(client);
    for (const roomName of roomNames) {
      const disconnectedPayload: MinRpsMatchDisconnectedPayload =
        new MinRpsMatchDisconnectedPayload();
      disconnectedPayload.gameId = roomName;
      disconnectedPayload.playerId = playerId ?? client.id;
      this.sendRoomEvent(roomName, MinRpsMatchEvent.Disconnected, disconnectedPayload);
      const gameState: MinRpsMatchPlayPayload = this.multiplayerService.getGameState(roomName);
      this.sendRoomEvent(roomName, MinRpsMatchEvent.GameStateUpdate, gameState);
    }
  }

  private sendClientEvent(client: Socket, event: MinRpsMatchEvent, payload: any): void {
    client.emit(event, payload);
  }

  private sendMatchUpdatedEvent(payload: MinRpsMatchUpdatedPayload): void {
    this.sendRoomEvent(payload.matchId, MinRpsMatchEvent.Updated, payload);
  }

  private sendRoomEvent(room: string, event: MinRpsMatchEvent, payload: any): void {
    this.server.to(room).emit(event, payload);
  }
}
