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
import { MinRpsGameStateUpdatePayload } from '../models/payloads/minrps-game-state-update.payload';
import type { MinRpsJoinPayload } from '../models/payloads/minrps-join.payload';
import { MinRpsJoinedPayload } from '../models/payloads/minrps-joined.payload';
import type { MinRpsLeavePayload } from '../models/payloads/minrps-leave.payload';
import { MinRpsLeftPayload } from '../models/payloads/minrps-left.payload';
import { MinRpsMoveSelectedPayload } from '../models/payloads/minrps-move-selected.payload';
import type { MinRpsPlayPayload } from '../models/payloads/minrps-play.payload';
import { MinRpsPlayedPayload } from '../models/payloads/minrps-played.payload';
import type { MinRpsSelectMovePayload } from '../models/payloads/minrps-select-move.payload';
import type { MinRpsTakeSeatPayload } from '../models/payloads/minrps-take-seat.payload';
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
    const joinedPayload: MinRpsJoinedPayload = this.multiplayerService.joinGame(
      client,
      joinPayload,
    );
    this.sendRoomEvent(joinedPayload.gameId, MinRpsGameEvent.Joined, joinedPayload);

    // Send current game state to the joining player
    const gameState: MinRpsGameStateUpdatePayload = this.multiplayerService.getGameState(
      joinPayload.gameId,
    );
    this.sendRoomEvent(joinedPayload.gameId, MinRpsGameEvent.GameStateUpdate, gameState);

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
    const gameState: MinRpsGameStateUpdatePayload = this.multiplayerService.getGameState(
      leavePayload.gameId,
    );
    this.sendRoomEvent(leavePayload.gameId, MinRpsGameEvent.GameStateUpdate, gameState);
    return new Acknowledgement();
  }

  @SubscribeMessage(MinRpsGameEvent.Play)
  public handlePlayEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() playPayload: MinRpsPlayPayload,
  ): Acknowledgement {
    console.log(`Player: ${playPayload.playerId} wants to play`, playPayload);
    const playedPayload: MinRpsPlayedPayload | null = this.multiplayerService.playGame(playPayload);

    if (playedPayload) {
      // Both players have selected moves, reveal and send results
      this.sendRoomEvent(playPayload.gameId, MinRpsGameEvent.Played, playedPayload);

      // Send updated game state
      const gameState: MinRpsGameStateUpdatePayload = this.multiplayerService.getGameState(
        playPayload.gameId,
      );
      this.sendRoomEvent(playPayload.gameId, MinRpsGameEvent.GameStateUpdate, gameState);
    }

    return new Acknowledgement();
  }

  @SubscribeMessage(MinRpsGameEvent.SelectMove)
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
    this.sendClientEvent(client, MinRpsGameEvent.MoveSelected, moveSelectedPayload);

    // Send game state update to all players (without revealing moves)
    const gameState: MinRpsGameStateUpdatePayload = this.multiplayerService.getGameState(
      selectMovePayload.gameId,
    );
    this.sendRoomEvent(selectMovePayload.gameId, MinRpsGameEvent.GameStateUpdate, gameState);

    return new Acknowledgement();
  }

  @SubscribeMessage(MinRpsGameEvent.TakeSeat)
  public handleTakeSeatEvent(
    @MessageBody() takeSeatPayload: MinRpsTakeSeatPayload,
  ): Acknowledgement {
    console.log(
      `Player: ${takeSeatPayload.playerId} wants seat ${takeSeatPayload.seat} in game: ${takeSeatPayload.gameId}`,
      takeSeatPayload,
    );
    const gameState: MinRpsGameStateUpdatePayload =
      this.multiplayerService.takeSeat(takeSeatPayload);
    this.sendRoomEvent(takeSeatPayload.gameId, MinRpsGameEvent.GameStateUpdate, gameState);
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
    const roomNames: string[] = this.multiplayerService.getAllPlayerRoomNames(client);
    const playerId: string | undefined = this.multiplayerService.getPlayerIdForSocket(client);
    this.multiplayerService.removePlayerFromAllRooms(client);
    if (playerId) {
      this.multiplayerService.removePlayerFromGames(roomNames, playerId);
    }
    this.multiplayerService.clearPlayerSocket(client);
    for (const roomName of roomNames) {
      const disconnectedPayload: MinRpsDisconnectedPayload = new MinRpsDisconnectedPayload();
      disconnectedPayload.gameId = roomName;
      disconnectedPayload.playerId = playerId ?? client.id;
      this.sendRoomEvent(roomName, MinRpsGameEvent.Disconnected, disconnectedPayload);
      const gameState: MinRpsGameStateUpdatePayload =
        this.multiplayerService.getGameState(roomName);
      this.sendRoomEvent(roomName, MinRpsGameEvent.GameStateUpdate, gameState);
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
