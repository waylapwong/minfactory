import { Injectable, NotFoundException } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MinRpsDomainMapper } from '../mapper/minrps-domain.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';
import { MinRpsResult } from '../models/enums/minrps-game-result.enum';
import { MinRpsMove } from '../models/enums/minrps-move.enum';
import { MinRpsMatchJoinPayload } from '../models/payloads/minrps-match-join.payload';
import { MinRpsMatchLeavePayload } from '../models/payloads/minrps-match-leave.payload';
import { MinRpsMatchPlayPayload } from '../models/payloads/minrps-match-play.payload';
import { MinRpsMatchUpdatedPayload } from '../models/payloads/minrps-match-updated.payload';
import { MinRpsMoveSelectedPayload } from '../models/payloads/minrps-move-selected.payload';
import { MinRpsSelectMovePayload } from '../models/payloads/minrps-select-move.payload';
import { MinRpsTakeSeatPayload } from '../models/payloads/minrps-take-seat.payload';
import { MinRpsGameRepository } from '../repositories/minrps-game.repository';
import { MinRpsMatchRepository } from '../repositories/minrps-match.repository';
import { MinRpsRoomSystem } from '../systems/minrps-room.system';
import { GameRuleException } from 'src/shared/exceptions/game-rule.exception';

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

  public joinMatch(client: Socket, command: MinRpsMatchJoinPayload): MinRpsMatchUpdatedPayload {
    this.socketIdPlayerIdMap.set(client.id, command.playerId);
    this.roomSystem.addPlayerToRoom(client, command.matchId);

    let game: MinRpsGame | null = this.matchRepository.findOne(command.matchId);
    if (!game) {
      game = new MinRpsGame();
      game.id = command.matchId;
    }

    game.addObserver(command.playerId);

    const updatedMatch: MinRpsGame = this.matchRepository.save(game);

    return MinRpsDomainMapper.domainToMatchUpdatedPayload(updatedMatch);
  }

  public leaveMatch(client: Socket, command: MinRpsMatchLeavePayload): MinRpsMatchUpdatedPayload {
    // Get match
    const match: MinRpsGame | null = this.matchRepository.findOne(command.matchId);
    if (!match) {
      throw new NotFoundException(`Match with ID ${command.matchId} not found`);
    }
    // Remove player from room & match
    this.roomSystem.removePlayerFromRoom(client, command.matchId);
    this.removePlayerFromMatch(command.playerId, match);
    // Update match
    const updatedMatch: MinRpsGame = this.matchRepository.save(match);
    // Return match state
    return MinRpsDomainMapper.domainToMatchUpdatedPayload(updatedMatch);
  }

  public playMatch(command: MinRpsMatchPlayPayload): MinRpsMatchUpdatedPayload {
    // Get match
    const match: MinRpsGame | null = this.matchRepository.findOne(command.matchId);
    // Validations
    if (!match) {
      throw new NotFoundException(`Match with ID ${command.matchId} not found`);
    }
    if (command.playerId !== match.player1.id && command.playerId !== match.player2.id) {
      throw new GameRuleException(`Player with ID ${command.playerId} is not part of the match`);
    }
    // Set player move
    if (match.player1.id === command.playerId) {
      match.setPlayer1Move(command.playerMove);
    } else if (match.player2.id === command.playerId) {
      match.setPlayer2Move(command.playerMove);
    }
    // Update match
    const updatedMatch: MinRpsGame = this.matchRepository.save(match);
    // Hide opponent's move until both players have played
    if (!updatedMatch.isGameReady()) {
      if (updatedMatch.isPlayer1(command.playerId)) {
        updatedMatch.resetPlayer2Move();
      } else if (updatedMatch.isPlayer2(command.playerId)) {
        updatedMatch.resetPlayer1Move();
      }
    }
    // Return match state
    return MinRpsDomainMapper.domainToMatchUpdatedPayload(updatedMatch);

    // Calculate results
    const gameResult = match.getResult();

    // Reset moves for next round
    match.resetPlayerMoves();
    this.matchRepository.save(command.gameId, match);
  }

  public removePlayerFromAllRooms(client: Socket): void {
    this.roomSystem.removePlayerFromAllRooms(client);
  }

  public removePlayerFromGames(gameIds: string[], playerId: string): void {
    for (const gameId of gameIds) {
      this.removePlayerFromMatch(gameId, playerId);
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

  public takeSeat(selectSeatPayload: MinRpsTakeSeatPayload): MinRpsMatchPlayPayload {
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
        game.addPlayer1(player);
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
        game.addPlayer2(player);
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

  private removePlayerFromMatch(playerId: string, match: MinRpsGame): void {
    if (playerId === match.player1.id) {
      match.removePlayer1();
    } else if (playerId === match.player2.id) {
      match.removePlayer2();
    } else if (match.observers.has(playerId)) {
      match.removeObserver(playerId);
    }
  }
}
