import { Injectable, NotFoundException } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MinRpsDomainMapper } from '../mapper/minrps-domain.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';
import { MinRpsMatchConnectedPayload } from '../models/payloads/minrps-match-connected.payload';
import { MinRpsMatchJoinPayload } from '../models/payloads/minrps-match-join.payload';
import { MinRpsMatchLeavePayload } from '../models/payloads/minrps-match-leave.payload';
import { MinRpsMatchPlayPayload } from '../models/payloads/minrps-match-play.payload';
import { MinRpsMatchSitPayload } from '../models/payloads/minrps-match-sit.payload';
import { MinRpsMatchUpdatedPayload } from '../models/payloads/minrps-match-updated.payload';
import { MinRpsMatchRepository } from '../repositories/minrps-match.repository';
import { MinRpsPlayerIdRepository } from '../repositories/minrps-player-id.repository';
import { MinRpsRoomSystem } from '../systems/minrps-room.system';
import { GameRuleException } from 'src/shared/exceptions/game-rule.exception';

@Injectable()
export class MinRpsMultiplayerService {
  constructor(
    private readonly matchRepository: MinRpsMatchRepository,
    private readonly playerIdRepository: MinRpsPlayerIdRepository,
    private readonly roomSystem: MinRpsRoomSystem,
  ) {}

  public handleConnection(client: Socket): MinRpsMatchConnectedPayload {
    // Build event payload
    const event: MinRpsMatchConnectedPayload = new MinRpsMatchConnectedPayload();
    event.playerId = crypto.randomUUID();
    // Register player in registry
    this.playerIdRepository.save(client.id, event.playerId);
    // Return event payload
    return event;
  }

  public handleDisconnect(client: Socket): MinRpsMatchUpdatedPayload | null {
    const playerId: string | null = this.playerIdRepository.findOne(client.id);
    const roomName: string | null = this.roomSystem.getPlayerRoomName(client);

    if (roomName && playerId) {
      const match: MinRpsGame | null = this.matchRepository.findOne(roomName);
      if (match) {
        match.removePlayer(playerId);
        this.matchRepository.save(match);
        this.roomSystem.removePlayerFromRoom(client, roomName);
        this.playerIdRepository.delete(client.id);
        return MinRpsDomainMapper.domainToMatchUpdatedPayload(match);
      }
      this.roomSystem.removePlayerFromRoom(client, roomName);
    }

    this.playerIdRepository.delete(client.id);
    return null;
  }

  public joinMatch(client: Socket, command: MinRpsMatchJoinPayload): MinRpsMatchUpdatedPayload {
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
    // Remove player from room
    this.roomSystem.removePlayerFromRoom(client, command.matchId);
    // Remove player from match
    match.removePlayer(command.playerId);
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

  public resetMatch(matchId: string): MinRpsMatchUpdatedPayload {
    // Get match
    const match: MinRpsGame | null = this.matchRepository.findOne(matchId);
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }
    // Reset player moves
    match.resetPlayerMoves();
    // Update match
    const updatedMatch: MinRpsGame = this.matchRepository.save(match);
    // Return match state
    return MinRpsDomainMapper.domainToMatchUpdatedPayload(updatedMatch);
  }

  public seatPlayer(command: MinRpsMatchSitPayload): MinRpsMatchUpdatedPayload {
    // Get match
    const match: MinRpsGame = this.matchRepository.findOrCreate(command.matchId);
    // Build player
    const player: MinRpsPlayer = new MinRpsPlayer();
    player.id = command.playerId;
    player.name = command.playerName;
    match.seatPlayer(player);
    // Update match
    const updatedMatch: MinRpsGame = this.matchRepository.save(match);
    // Return match state
    return MinRpsDomainMapper.domainToMatchUpdatedPayload(updatedMatch);
  }
}
