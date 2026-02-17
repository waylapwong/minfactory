import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MinRpsResult } from '../models/enums/minrps-game-result.enum';
import { MinRpsMove } from '../models/enums/minrps-move.enum';
import { MinRpsGameStateUpdatePayload } from '../models/payloads/minrps-game-state-update.payload';
import { MinRpsJoinPayload } from '../models/payloads/minrps-join.payload';
import { MinRpsJoinedPayload } from '../models/payloads/minrps-joined.payload';
import { MinRpsLeavePayload } from '../models/payloads/minrps-leave.payload';
import { MinRpsLeftPayload } from '../models/payloads/minrps-left.payload';
import { MinRpsMoveSelectedPayload } from '../models/payloads/minrps-move-selected.payload';
import { MinRpsPlayPayload } from '../models/payloads/minrps-play.payload';
import { MinRpsPlayedPayload } from '../models/payloads/minrps-played.payload';
import { MinRpsSelectMovePayload } from '../models/payloads/minrps-select-move.payload';
import { MinRpsTakeSeatPayload } from '../models/payloads/minrps-take-seat.payload';
import { MinRpsRoomSystem } from '../systems/minrps-room.system';

interface GameRoomState {
  player1Id: string;
  player1Name: string;
  player1Move: MinRpsMove;
  player2Id: string;
  player2Name: string;
  player2Move: MinRpsMove;
}

@Injectable()
export class MinRpsMultiplayerService {
  private gameRoomStates: Map<string, GameRoomState> = new Map();
  private readonly socketPlayerIds: Map<string, string> = new Map();

  constructor(private readonly roomSystem: MinRpsRoomSystem) {}

  public getAllPlayerRoomNames(client: Socket): string[] {
    return this.roomSystem.getAllPlayerRoomNames(client);
  }

  public getPlayerIdForSocket(client: Socket): string | undefined {
    return this.socketPlayerIds.get(client.id);
  }

  public getGameState(gameId: string): MinRpsGameStateUpdatePayload {
    const state = this.gameRoomStates.get(gameId);
    const payload = new MinRpsGameStateUpdatePayload();
    payload.gameId = gameId;
    payload.player1Id = state?.player1Id || '';
    payload.player1Name = state?.player1Name || '';
    payload.player1HasSelectedMove = state?.player1Move !== MinRpsMove.None;
    payload.player1Move = MinRpsMove.None;
    payload.player2Id = state?.player2Id || '';
    payload.player2Name = state?.player2Name || '';
    payload.player2HasSelectedMove = state?.player2Move !== MinRpsMove.None;
    payload.player2Move = MinRpsMove.None;
    return payload;
  }

  public joinGame(client: Socket, joinPayload: MinRpsJoinPayload): MinRpsJoinedPayload {
    this.socketPlayerIds.set(client.id, joinPayload.playerId);

    // Player joins room
    this.roomSystem.addPlayerToRoom(client, joinPayload.gameId);
    
    // Initialize or update game state
    let state = this.gameRoomStates.get(joinPayload.gameId);
    if (!state) {
      state = {
        player1Id: '',
        player1Name: '',
        player1Move: MinRpsMove.None,
        player2Id: '',
        player2Name: '',
        player2Move: MinRpsMove.None,
      };
      this.gameRoomStates.set(joinPayload.gameId, state);
    }

    // Build payload
    const joinedPayload: MinRpsJoinedPayload = new MinRpsJoinedPayload();
    joinedPayload.gameId = joinPayload.gameId;
    joinedPayload.playerId = joinPayload.playerId;

    return joinedPayload;
  }

  public leaveGame(client: Socket, leavePayload: MinRpsLeavePayload): MinRpsLeftPayload {
    // Player leaves room
    this.roomSystem.removePlayerFromRoom(client, leavePayload.gameId);

    this.removePlayerFromGame(leavePayload.gameId, leavePayload.playerId);

    // Build payload
    const leftPayload: MinRpsLeftPayload = new MinRpsLeftPayload();
    leftPayload.gameId = leavePayload.gameId;
    leftPayload.playerId = leavePayload.playerId;

    return leftPayload;
  }

  public playGame(playPayload: MinRpsPlayPayload): MinRpsPlayedPayload | null {
    const state = this.gameRoomStates.get(playPayload.gameId);
    if (!state || !state.player1Id || !state.player2Id) {
      return null;
    }

    if (playPayload.playerId !== state.player1Id && playPayload.playerId !== state.player2Id) {
      return null;
    }

    // Check if both players have selected moves
    if (state.player1Move === MinRpsMove.None || state.player2Move === MinRpsMove.None) {
      return null;
    }

    // Calculate results
    const gameResult = this.calculateGameResult(state.player1Move, state.player2Move);

    const playedPayload = new MinRpsPlayedPayload();
    playedPayload.gameId = playPayload.gameId;
    playedPayload.player1Id = state.player1Id;
    playedPayload.player1Move = state.player1Move;
    playedPayload.player1Result = gameResult;
    playedPayload.player2Id = state.player2Id;
    playedPayload.player2Move = state.player2Move;
    playedPayload.player2Result = this.invertResult(gameResult);

    // Reset moves for next round
    state.player1Move = MinRpsMove.None;
    state.player2Move = MinRpsMove.None;

    return playedPayload;
  }

  public removePlayerFromAllRooms(client: Socket): void {
    this.roomSystem.removePlayerFromAllRooms(client);
  }

  public removePlayerFromGames(gameIds: string[], playerId: string): void {
    for (const gameId of gameIds) {
      this.removePlayerFromGame(gameId, playerId);
    }
  }

  public clearPlayerSocket(client: Socket): void {
    this.socketPlayerIds.delete(client.id);
  }

  public selectMove(selectMovePayload: MinRpsSelectMovePayload): MinRpsMoveSelectedPayload {
    const state = this.gameRoomStates.get(selectMovePayload.gameId);
    if (state) {
      if (state.player1Id === selectMovePayload.playerId) {
        state.player1Move = selectMovePayload.move;
      } else if (state.player2Id === selectMovePayload.playerId) {
        state.player2Move = selectMovePayload.move;
      }
    }

    const moveSelectedPayload = new MinRpsMoveSelectedPayload();
    moveSelectedPayload.gameId = selectMovePayload.gameId;
    moveSelectedPayload.playerId = selectMovePayload.playerId;
    moveSelectedPayload.move = selectMovePayload.move;

    return moveSelectedPayload;
  }

  public takeSeat(selectSeatPayload: MinRpsTakeSeatPayload): MinRpsGameStateUpdatePayload {
    const state = this.getOrCreateState(selectSeatPayload.gameId);
    const cleanedName = selectSeatPayload.playerName.trim().slice(0, 16);

    if (!cleanedName) {
      return this.getGameState(selectSeatPayload.gameId);
    }

    const isPlayer1 = state.player1Id === selectSeatPayload.playerId;
    const isPlayer2 = state.player2Id === selectSeatPayload.playerId;

    if (selectSeatPayload.seat === 1) {
      if (isPlayer2) {
        return this.getGameState(selectSeatPayload.gameId);
      }
      if (!state.player1Id || isPlayer1) {
        state.player1Id = selectSeatPayload.playerId;
        state.player1Name = cleanedName;
        state.player1Move = MinRpsMove.None;
      }
    } else if (selectSeatPayload.seat === 2) {
      if (isPlayer1) {
        return this.getGameState(selectSeatPayload.gameId);
      }
      if (!state.player2Id || isPlayer2) {
        state.player2Id = selectSeatPayload.playerId;
        state.player2Name = cleanedName;
        state.player2Move = MinRpsMove.None;
      }
    }

    return this.getGameState(selectSeatPayload.gameId);
  }

  private calculateGameResult(player1Move: MinRpsMove, player2Move: MinRpsMove): MinRpsResult {
    if (player1Move === player2Move) {
      return MinRpsResult.Draw;
    }

    if (
      (player1Move === MinRpsMove.Rock && player2Move === MinRpsMove.Scissors) ||
      (player1Move === MinRpsMove.Paper && player2Move === MinRpsMove.Rock) ||
      (player1Move === MinRpsMove.Scissors && player2Move === MinRpsMove.Paper)
    ) {
      return MinRpsResult.Player1;
    }

    return MinRpsResult.Player2;
  }

  private invertResult(result: MinRpsResult): MinRpsResult {
    if (result === MinRpsResult.Player1) {
      return MinRpsResult.Player2;
    } else if (result === MinRpsResult.Player2) {
      return MinRpsResult.Player1;
    }
    return MinRpsResult.Draw;
  }

  private removePlayerFromGame(gameId: string, playerId: string): void {
    const state = this.gameRoomStates.get(gameId);
    if (!state) {
      return;
    }

    if (state.player1Id === playerId) {
      state.player1Id = '';
      state.player1Name = '';
      state.player1Move = MinRpsMove.None;
    } else if (state.player2Id === playerId) {
      state.player2Id = '';
      state.player2Name = '';
      state.player2Move = MinRpsMove.None;
    }

    if (!state.player1Id && !state.player2Id) {
      this.gameRoomStates.delete(gameId);
    }
  }

  private getOrCreateState(gameId: string): GameRoomState {
    let state = this.gameRoomStates.get(gameId);
    if (!state) {
      state = {
        player1Id: '',
        player1Name: '',
        player1Move: MinRpsMove.None,
        player2Id: '',
        player2Name: '',
        player2Move: MinRpsMove.None,
      };
      this.gameRoomStates.set(gameId, state);
    }
    return state;
  }
}
