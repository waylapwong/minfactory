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
import { MinRpsMatchEvent } from '../models/enums/minrps-match-event.enum';
import { MinRpsMatchConnectedPayload } from '../models/payloads/minrps-match-connected.payload';
import { MinRpsMatchDisconnectedPayload } from '../models/payloads/minrps-match-disconnected.payload';
import type { MinRpsMatchJoinPayload } from '../models/payloads/minrps-match-join.payload';
import type { MinRpsMatchLeavePayload } from '../models/payloads/minrps-match-leave.payload';
import { MinRpsMatchUpdatedPayload } from '../models/payloads/minrps-match-updated.payload';
import { MinRpsMatchUpdatePayload } from '../models/payloads/minrps-update.payload';
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

  @SubscribeMessage(MinRpsMatchEvent.Join)
  public handleJoinCommand(
    @ConnectedSocket() client: Socket,
    @MessageBody() commandPayload: MinRpsMatchJoinPayload,
  ): void {
    const eventPayload: MinRpsMatchUpdatedPayload = this.multiplayerService.joinGame(
      client,
      commandPayload,
    );
    this.sendMatchUpdatedEvent(eventPayload);
  }

  @SubscribeMessage(MinRpsMatchEvent.Leave)
  public handleLeaveCommand(
    @ConnectedSocket() client: Socket,
    @MessageBody() commandPayload: MinRpsMatchLeavePayload,
  ): void {
    const eventPayload: MinRpsMatchUpdatedPayload = this.multiplayerService.leaveGame(
      client,
      commandPayload,
    );
    this.sendMatchUpdatedEvent(eventPayload);
  }

  @SubscribeMessage(MinRpsMatchEvent.Play)
  public handlePlayEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() playPayload: MinRpsPlayPayload,
  ): Acknowledgement {
    console.log(`Player: ${playPayload.playerId} wants to play`, playPayload);
    const playedPayload: MinRpsPlayedPayload | null = this.multiplayerService.playGame(playPayload);

    if (playedPayload) {
      // Both players have selected moves, reveal and send results
      this.sendRoomEvent(playPayload.gameId, MinRpsMatchEvent.Played, playedPayload);

      // Send updated game state
      const gameState: MinRpsMatchUpdatePayload = this.multiplayerService.getGameState(
        playPayload.gameId,
      );
      this.sendRoomEvent(playPayload.gameId, MinRpsMatchEvent.GameStateUpdate, gameState);
    }

    return new Acknowledgement();
  }

  @SubscribeMessage(MinRpsMatchEvent.SelectMove)
  public handleSelectMoveEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() selectMovePayload: MinRpsSelectMovePayload,
  ): Acknowledgement {
    console.log(
      `Player: ${selectMovePayload.playerId} selected move: ${selectMovePayload.move}`,
      selectMovePayload,
    );
    const moveSelectedPayload: MinRpsMoveSelectedPayload =
      this.multiplayerService.selectMove(selectMovePayload);

    // Only notify the player who selected the move (keep it secret from opponent)
    this.sendClientEvent(client, MinRpsMatchEvent.MoveSelected, moveSelectedPayload);

    // Send game state update to all players (without revealing moves)
    const gameState: MinRpsMatchUpdatePayload = this.multiplayerService.getGameState(
      selectMovePayload.gameId,
    );
    this.sendRoomEvent(selectMovePayload.gameId, MinRpsMatchEvent.GameStateUpdate, gameState);

    return new Acknowledgement();
  }

  @SubscribeMessage(MinRpsMatchEvent.TakeSeat)
  public handleTakeSeatEvent(
    @MessageBody() takeSeatPayload: MinRpsTakeSeatPayload,
  ): Acknowledgement {
    console.log(
      `Player: ${takeSeatPayload.playerId} wants seat ${takeSeatPayload.seat} in game: ${takeSeatPayload.gameId}`,
      takeSeatPayload,
    );
    const gameState: MinRpsMatchUpdatePayload = this.multiplayerService.takeSeat(takeSeatPayload);
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
      const gameState: MinRpsMatchUpdatePayload = this.multiplayerService.getGameState(roomName);
      this.sendRoomEvent(roomName, MinRpsMatchEvent.GameStateUpdate, gameState);
    }
  }

  private sendClientEvent(client: Socket, event: MinRpsMatchEvent, payload: any): void {
    client.emit(event, payload);
  }

  private sendMatchUpdatedEvent(eventPayload: MinRpsMatchUpdatedPayload): void {
    this.sendRoomEvent(eventPayload.matchId, MinRpsMatchEvent.Updated, eventPayload);
  }

  private sendRoomEvent(room: string, event: MinRpsMatchEvent, payload: any): void {
    this.server.to(room).emit(event, payload);
  }
}
