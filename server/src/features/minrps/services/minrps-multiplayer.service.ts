import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MinRpsDomainMapper } from '../mapper/minrps-domain.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';
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
import { MinRpsMatchRepository } from '../repositories/minrps-match.repository';
import { MinRpsRoomSystem } from '../systems/minrps-room.system';

@Injectable()
export class MinRpsMultiplayerService {
  private readonly gameState: Map<string, MinRpsGame> = new Map();
  private readonly socketIdPlayerIdMap: Map<string, string> = new Map();

  constructor(
    private readonly roomSystem: MinRpsRoomSystem,
    private readonly matchRepository: MinRpsMatchRepository,
  ) {}

  public clearPlayerSocket(client: Socket): void {
    this.socketIdPlayerIdMap.delete(client.id);
  }

  public getAllPlayerRoomNames(client: Socket): string[] {
    return this.roomSystem.getAllPlayerRoomNames(client);
  }

  public getGameState(gameId: string): MinRpsGameStateUpdatePayload {
    const game = this.gameState.get(gameId);
    if (!game) {
      const emptyPayload = new MinRpsGameStateUpdatePayload();
      emptyPayload.gameId = gameId;
      emptyPayload.player1Id = '';
      emptyPayload.player1Name = '';
      emptyPayload.player1HasSelectedMove = false;
      emptyPayload.player1Move = MinRpsMove.None;
      emptyPayload.player2Id = '';
      emptyPayload.player2Name = '';
      emptyPayload.player2HasSelectedMove = false;
      emptyPayload.player2Move = MinRpsMove.None;
      return emptyPayload;
    }
    return MinRpsDomainMapper.domainToGameStateUpdatePayload(game);
  }

  public getPlayerIdForSocket(client: Socket): string | undefined {
    return this.socketIdPlayerIdMap.get(client.id);
  }

  public joinGame(client: Socket, joinPayload: MinRpsJoinPayload): MinRpsJoinedPayload {
    // TODO: what for? maybe on disconnect to retrieve the playerid by socket id?
    this.socketIdPlayerIdMap.set(client.id, joinPayload.playerId);

    this.roomSystem.addPlayerToRoom(client, joinPayload.gameId);

    // Initialize or update game state
    let game = this.gameState.get(joinPayload.gameId);
    if (!game) {
      game = new MinRpsGame();
      game.id = joinPayload.gameId;
      this.gameState.set(joinPayload.gameId, game);
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
    const game = this.gameState.get(playPayload.gameId);
    if (!game || !game.player1.id || !game.player2.id) {
      return null;
    }

    if (playPayload.playerId !== game.player1.id && playPayload.playerId !== game.player2.id) {
      return null;
    }

    // Check if both players have selected moves
    if (!game.hasPlayer1SelectedMove() || !game.hasPlayer2SelectedMove()) {
      return null;
    }

    // Calculate results
    const gameResult = game.getResult();

    const playedPayload = new MinRpsPlayedPayload();
    playedPayload.gameId = playPayload.gameId;
    playedPayload.player1Id = game.player1.id;
    playedPayload.player1Move = game.player1.move;
    playedPayload.player1Result = gameResult;
    playedPayload.player2Id = game.player2.id;
    playedPayload.player2Move = game.player2.move;
    playedPayload.player2Result = this.invertResult(gameResult);

    // Reset moves for next round
    game.resetMoves();

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

  public selectMove(selectMovePayload: MinRpsSelectMovePayload): MinRpsMoveSelectedPayload {
    const game = this.gameState.get(selectMovePayload.gameId);
    if (game) {
      if (game.player1.id === selectMovePayload.playerId) {
        game.setPlayer1Move(selectMovePayload.move);
      } else if (game.player2.id === selectMovePayload.playerId) {
        game.setPlayer2Move(selectMovePayload.move);
      }
    }

    const moveSelectedPayload = new MinRpsMoveSelectedPayload();
    moveSelectedPayload.gameId = selectMovePayload.gameId;
    moveSelectedPayload.playerId = selectMovePayload.playerId;
    moveSelectedPayload.move = selectMovePayload.move;

    return moveSelectedPayload;
  }

  public takeSeat(selectSeatPayload: MinRpsTakeSeatPayload): MinRpsGameStateUpdatePayload {
    const game = this.getOrCreateGame(selectSeatPayload.gameId);
    const cleanedName = selectSeatPayload.playerName.trim().slice(0, 16);

    if (!cleanedName) {
      return this.getGameState(selectSeatPayload.gameId);
    }

    const isPlayer1 = game.player1.id === selectSeatPayload.playerId;
    const isPlayer2 = game.player2.id === selectSeatPayload.playerId;

    if (selectSeatPayload.seat === 1) {
      if (isPlayer2) {
        return this.getGameState(selectSeatPayload.gameId);
      }
      if (!game.player1.id || isPlayer1) {
        const player = new MinRpsPlayer();
        player.id = selectSeatPayload.playerId;
        player.name = cleanedName;
        player.move = MinRpsMove.None;
        game.setPlayer1(player);
      }
    } else if (selectSeatPayload.seat === 2) {
      if (isPlayer1) {
        return this.getGameState(selectSeatPayload.gameId);
      }
      if (!game.player2.id || isPlayer2) {
        const player = new MinRpsPlayer();
        player.id = selectSeatPayload.playerId;
        player.name = cleanedName;
        player.move = MinRpsMove.None;
        game.setPlayer2(player);
      }
    }

    return this.getGameState(selectSeatPayload.gameId);
  }

  private getOrCreateGame(gameId: string): MinRpsGame {
    let game = this.gameState.get(gameId);
    if (!game) {
      game = new MinRpsGame();
      game.id = gameId;
      this.gameState.set(gameId, game);
    }
    return game;
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
    const game = this.gameState.get(gameId);
    if (!game) {
      return;
    }

    if (game.player1.id === playerId) {
      const emptyPlayer = new MinRpsPlayer();
      game.setPlayer1(emptyPlayer);
    } else if (game.player2.id === playerId) {
      const emptyPlayer = new MinRpsPlayer();
      game.setPlayer2(emptyPlayer);
    }

    if (!game.player1.id && !game.player2.id) {
      this.gameState.delete(gameId);
    }
  }
}
