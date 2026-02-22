import { Injectable, NotFoundException } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MinRpsDomainMapper } from '../mapper/minrps-domain.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';
import { MinRpsResult } from '../models/enums/minrps-game-result.enum';
import { MinRpsMove } from '../models/enums/minrps-move.enum';
import { MinRpsLeftPayload } from '../models/payloads/minrps-left.payload';
import { MinRpsMatchJoinPayload } from '../models/payloads/minrps-match-join.payload';
import { MinRpsMatchLeavePayload } from '../models/payloads/minrps-match-leave.payload';
import { MinRpsMatchUpdatedPayload } from '../models/payloads/minrps-match-updated.payload';
import { MinRpsMoveSelectedPayload } from '../models/payloads/minrps-move-selected.payload';
import { MinRpsPlayPayload } from '../models/payloads/minrps-play.payload';
import { MinRpsPlayedPayload } from '../models/payloads/minrps-played.payload';
import { MinRpsSelectMovePayload } from '../models/payloads/minrps-select-move.payload';
import { MinRpsTakeSeatPayload } from '../models/payloads/minrps-take-seat.payload';
import { MinRpsMatchUpdatePayload } from '../models/payloads/minrps-update.payload';
import { MinRpsGameRepository } from '../repositories/minrps-game.repository';
import { MinRpsMatchRepository } from '../repositories/minrps-match.repository';
import { MinRpsRoomSystem } from '../systems/minrps-room.system';

@Injectable()
export class MinRpsMultiplayerService {
  private readonly socketIdPlayerIdMap: Map<string, string> = new Map();

  constructor(
    private readonly roomSystem: MinRpsRoomSystem,
    private readonly matchRepository: MinRpsMatchRepository,
    private readonly gameRepository: MinRpsGameRepository,
  ) {}

  public clearPlayerSocket(client: Socket): void {
    this.socketIdPlayerIdMap.delete(client.id);
  }

  public getAllPlayerRoomNames(client: Socket): string[] {
    return this.roomSystem.getAllPlayerRoomNames(client);
  }

  public getGameState(gameId: string): MinRpsMatchUpdatedPayload {
    const match: MinRpsGame | null = this.matchRepository.findOne(gameId);
    if (!match) {
      throw new NotFoundException(`Match with ID ${gameId} not found`);
    }
    return MinRpsDomainMapper.domainToMatchUpdatedPayload(match);
  }

  public getPlayerIdForSocket(client: Socket): string | undefined {
    return this.socketIdPlayerIdMap.get(client.id);
  }

  public joinGame(
    client: Socket,
    commandPayload: MinRpsMatchJoinPayload,
  ): MinRpsMatchUpdatedPayload {
    this.socketIdPlayerIdMap.set(client.id, commandPayload.playerId);
    this.roomSystem.addPlayerToRoom(client, commandPayload.matchId);

    this.gameRepository.findOne(commandPayload.matchId);

    let game: MinRpsGame | null = this.matchRepository.findOne(commandPayload.matchId);
    if (!game) {
      game = new MinRpsGame();
      game.id = commandPayload.matchId;
    }

    game.addObserver(commandPayload.playerId);

    const updatedMatch: MinRpsGame = this.matchRepository.save(commandPayload.matchId, game);

    return MinRpsDomainMapper.domainToMatchUpdatedPayload(updatedMatch);
  }

  public leaveGame(client: Socket, leavePayload: MinRpsMatchLeavePayload): MinRpsLeftPayload {
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
    const game = this.matchRepository.findOne(playPayload.gameId);
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
    this.matchRepository.save(playPayload.gameId, game);

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
    const game = this.matchRepository.findOne(selectMovePayload.gameId);
    if (game) {
      if (game.player1.id === selectMovePayload.playerId) {
        game.setPlayer1Move(selectMovePayload.move);
      } else if (game.player2.id === selectMovePayload.playerId) {
        game.setPlayer2Move(selectMovePayload.move);
      }
      this.matchRepository.save(selectMovePayload.gameId, game);
    }

    const moveSelectedPayload = new MinRpsMoveSelectedPayload();
    moveSelectedPayload.gameId = selectMovePayload.gameId;
    moveSelectedPayload.playerId = selectMovePayload.playerId;
    moveSelectedPayload.move = selectMovePayload.move;

    return moveSelectedPayload;
  }

  public takeSeat(selectSeatPayload: MinRpsTakeSeatPayload): MinRpsMatchUpdatePayload {
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

    this.matchRepository.save(selectSeatPayload.gameId, game);
    return this.getGameState(selectSeatPayload.gameId);
  }

  private getOrCreateGame(gameId: string): MinRpsGame {
    let game = this.matchRepository.findOne(gameId);
    if (!game) {
      game = new MinRpsGame();
      game.id = gameId;
      this.matchRepository.save(gameId, game);
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
    const game = this.matchRepository.findOne(gameId);
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
      this.matchRepository.delete(gameId);
    } else {
      this.matchRepository.save(gameId, game);
    }
  }
}
