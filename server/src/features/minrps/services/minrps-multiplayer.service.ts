import { Injectable, NotFoundException } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MinRpsDomainMapper } from '../mapper/minrps-domain.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';
import { MinRpsMatchJoinPayload } from '../models/payloads/minrps-match-join.payload';
import { MinRpsMatchLeavePayload } from '../models/payloads/minrps-match-leave.payload';
import { MinRpsMatchPlayPayload } from '../models/payloads/minrps-match-play.payload';
import { MinRpsMatchSitPayload } from '../models/payloads/minrps-match-sit.payload';
import { MinRpsMatchUpdatedPayload } from '../models/payloads/minrps-match-updated.payload';
import { MinRpsMatchRepository } from '../repositories/minrps-match.repository';
import { MinRpsRoomSystem } from '../systems/minrps-room.system';
import { GameRuleException } from 'src/shared/exceptions/game-rule.exception';

@Injectable()
export class MinRpsMultiplayerService {
  private readonly socketIdPlayerIdMap: Map<string, string> = new Map();

  constructor(
    private readonly roomSystem: MinRpsRoomSystem,
    private readonly matchRepository: MinRpsMatchRepository,
  ) {}

  public joinMatch(client: Socket, command: MinRpsMatchJoinPayload): MinRpsMatchUpdatedPayload {
    this.socketIdPlayerIdMap.set(client.id, command.playerId);
    // Add observer to room
    this.roomSystem.addPlayerToRoom(client, command.matchId);
    // Get or create match
    const game: MinRpsGame = this.matchRepository.findOrCreate(command.matchId);
    // Add observer
    game.addObserver(command.playerId);
    // Update match
    const updatedMatch: MinRpsGame = this.matchRepository.save(game);
    // Return match state
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
  }

  public sitMatch(command: MinRpsMatchSitPayload): MinRpsMatchUpdatedPayload {
    // Get match
    const match: MinRpsGame = this.matchRepository.findOrCreate(command.matchId);
    // Build player
    const player: MinRpsPlayer = new MinRpsPlayer();
    player.id = command.playerId;
    player.name = command.playerName;
    match.sitPlayer(player);
    // Update match
    const updatedMatch: MinRpsGame = this.matchRepository.save(match);
    // Return match state
    return MinRpsDomainMapper.domainToMatchUpdatedPayload(updatedMatch);
  }

  private clearPlayerSocket(client: Socket): void {
    this.socketIdPlayerIdMap.delete(client.id);
  }

  private getAllPlayerRoomNames(client: Socket): string[] {
    return this.roomSystem.getAllPlayerRoomNames(client);
  }

  private getGameState(gameId: string): MinRpsMatchUpdatedPayload {
    const match: MinRpsGame | null = this.matchRepository.findOne(gameId);
    if (!match) {
      throw new NotFoundException(`Match with ID ${gameId} not found`);
    }
    return MinRpsDomainMapper.domainToMatchUpdatedPayload(match);
  }

  private getPlayerIdForSocket(client: Socket): string | undefined {
    return this.socketIdPlayerIdMap.get(client.id);
  }

  private removePlayerFromAllRooms(client: Socket): void {
    this.roomSystem.removePlayerFromAllRooms(client);
  }

  private removePlayerFromGames(gameIds: string[], playerId: string): void {
    for (const gameId of gameIds) {
      this.removePlayerFromMatch(gameId, playerId);
    }
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
