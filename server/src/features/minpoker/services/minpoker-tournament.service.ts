import { ForbiddenException, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MinFactoryUserEntity } from '../../minfactory/models/entities/minfactory-user.entity';
import { MinFactoryUserRepository } from '../../minfactory/repositories/minfactory-user.repository';
import { MinPokerDomainMapper } from '../mapper/minpoker-domain.mapper';
import { MinPokerEntityMapper } from '../mapper/minpoker-entity.mapper';
import { MinPokerJoinCommand } from '../models/commands/minpoker-join.command';
import { MinPokerLeaveCommand } from '../models/commands/minpoker-leave.command';
import { MinPokerSeatCommand } from '../models/commands/minpoker-seat.command';
import { MinPokerDeck } from '../models/domains/minpoker-deck';
import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerPlayer } from '../models/domains/minpoker-player';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';
import { MinPokerConnectedEvent } from '../models/events/minpoker-connected.event';
import { MinPokerDisconnectedEvent } from '../models/events/minpoker-disconnected.event';
import { MinPokerHandDealtEvent } from '../models/events/minpoker-hand-dealt.event';
import { MinPokerUpdatedEvent } from '../models/events/minpoker-updated.event';
import { MinPokerDeckRepository } from '../repositories/minpoker-deck.repository';
import { MinPokerGameRepository } from '../repositories/minpoker-game.repository';
import { MinPokerMatchRepository } from '../repositories/minpoker-match.repository';
import { MinPokerPlayerIdRepository } from '../repositories/minpoker-player-id.repository';
import { MinPokerRoomSystem } from '../systems/minpoker-room.system';

export interface MinPokerDisconnectResult {
  disconnectedEvent: MinPokerDisconnectedEvent;
  updatedEvent: MinPokerUpdatedEvent | null;
}

export interface MinPokerSeatResult {
  hands: Map<string, MinPokerHandDealtEvent> | null;
  updatedEvent: MinPokerUpdatedEvent;
}

@Injectable()
export class MinPokerTournamentService {
  constructor(
    private readonly deckRepository: MinPokerDeckRepository,
    private readonly gameRepository: MinPokerGameRepository,
    private readonly matchRepository: MinPokerMatchRepository,
    private readonly playerIdRepository: MinPokerPlayerIdRepository,
    private readonly roomSystem: MinPokerRoomSystem,
    private readonly userRepository: MinFactoryUserRepository,
  ) {}

  public async handleConnectionCommand(clientSocket: Socket, firebaseUid: string): Promise<MinPokerConnectedEvent> {
    // GET USER ID
    const userEntity: MinFactoryUserEntity = await this.userRepository.findByFirebaseUid(firebaseUid);
    const userId: string = userEntity.id;
    // BIND SOCKET ID TO USER ID
    clientSocket.data.playerId = userId;
    // SAVE SOCKET ID <-> USER ID MAPPING
    this.playerIdRepository.save(clientSocket.id, userId);
    // BUILD EVENT
    const event: MinPokerConnectedEvent = new MinPokerConnectedEvent();
    event.playerId = userId;
    // RETURN EVENT
    return event;
  }

  public handleDisconnectCommand(clientSocket: Socket): MinPokerDisconnectResult | null {
    // GET PLAYER ID & MATCH ID
    const playerId: string | null = this.playerIdRepository.findOne(clientSocket.id) ?? clientSocket.data?.playerId ?? null;
    const matchId: string | null = this.roomSystem.getPlayerRoomName(clientSocket);
    // REMOVE CLIENT SOCKET FROM ALL ROOMS
    this.roomSystem.removePlayerFromAllRooms(clientSocket);
    // RETURN NULL, IF PLAYER ID NOT FOUND
    if (!playerId) {
      return null;
    }
    // DELETE SOCKET ID <-> USER ID MAPPING
    this.playerIdRepository.delete(clientSocket.id);
    // BUILD DISCONNECTED EVENT
    const disconnectedEvent: MinPokerDisconnectedEvent = new MinPokerDisconnectedEvent();
    disconnectedEvent.playerId = playerId;
    disconnectedEvent.matchId = matchId;
    // UPDATE MATCH STATE, IF MATCH FOUND
    let updatedEvent: MinPokerUpdatedEvent | null = null;
    if (matchId) {
      const match: MinPokerGame | null = this.matchRepository.findOne(matchId);
      if (match) {
        match.removePlayer(playerId);
        if (match.hasParticipants()) {
          const updatedMatch: MinPokerGame = this.matchRepository.save(match);
          updatedEvent = MinPokerDomainMapper.toUpdatedEvent(updatedMatch);
        } else {
          this.matchRepository.delete(match.id);
          this.deckRepository.delete(match.id);
        }
      }
    }
    // RETURN RESULT
    return { disconnectedEvent, updatedEvent };
  }

  public async handleJoinCommand(clientSocket: Socket, command: MinPokerJoinCommand): Promise<MinPokerUpdatedEvent> {
    // GET PLAYER ID (validate before any room operations)
    const playerId: string = this.resolvePlayerId(clientSocket, command.playerId);
    // REMOVE SOCKET FROM ALL PREVIOUS ROOMS
    this.roomSystem.removePlayerFromAllRooms(clientSocket);
    // ADD SOCKET TO MATCH ROOM
    this.roomSystem.addPlayerToRoom(clientSocket, command.matchId);
    // GET MATCH
    const match: MinPokerGame = await this.findOrCreateMatch(command.matchId);
    // UPDATE MATCH
    match.addObserver(playerId);
    // SAVE MATCH
    const updatedMatch: MinPokerGame = this.matchRepository.save(match);
    // RETURN EVENT
    return MinPokerDomainMapper.toUpdatedEvent(updatedMatch);
  }

  public handleLeaveCommand(clientSocket: Socket, command: MinPokerLeaveCommand): MinPokerUpdatedEvent | null {
    // GET PLAYER ID
    const playerId: string = this.resolvePlayerId(clientSocket, command.playerId);
    // GET MATCH
    const match: MinPokerGame | null = this.matchRepository.findOne(command.matchId);
    // BUILD EVENT
    let updatedEvent: MinPokerUpdatedEvent | null = null;
    // REMOVE PLAYER
    if (match) {
      match.removePlayer(playerId);
      if (match.hasParticipants()) {
        // IF ANY PLAYERS LEFT: UPDATE MATCH
        const updatedMatch: MinPokerGame = this.matchRepository.save(match);
        updatedEvent = MinPokerDomainMapper.toUpdatedEvent(updatedMatch);
      } else {
        // ELSE: DELETE MATCH
        this.matchRepository.delete(match.id);
        this.deckRepository.delete(match.id);
      }
    }
    // REMOVE SOCKET FROM ROOM
    this.roomSystem.removePlayerFromRoom(clientSocket, command.matchId);
    // RETURN EVENT
    return updatedEvent;
  }

  public async handleSeatCommand(clientSocket: Socket, command: MinPokerSeatCommand): Promise<MinPokerSeatResult> {
    // BUILD PLAYER
    const playerId: string = this.resolvePlayerId(clientSocket, command.playerId);
    const player: MinPokerPlayer = new MinPokerPlayer({
      avatar: command.avatar,
      id: playerId,
      name: command.playerName,
    });
    // GET MATCH
    const match: MinPokerGame = await this.findOrCreateMatch(command.matchId);
    // UPDATE MATCH
    match.seatPlayer(player, command.seat);
    // DEAL HANDS, ONLY WHEN ROUND STARTS FOR THE FIRST TIME (no deck yet)
    let hands: Map<string, MinPokerHandDealtEvent> | null = null;
    if (match.canStartRound() && !this.deckRepository.findOne(match.id)) {
      const deck: MinPokerDeck = new MinPokerDeck();
      deck.shuffle();
      this.deckRepository.save(match.id, deck);
      match.dealHands(deck);
      hands = this.buildHandDealtEvents(match);
    }
    // SAVE MATCH
    const updatedMatch: MinPokerGame = this.matchRepository.save(match);
    // RETURN EVENT
    return {
      updatedEvent: MinPokerDomainMapper.toUpdatedEvent(updatedMatch),
      hands,
    };
  }

  private buildHandDealtEvents(match: MinPokerGame): Map<string, MinPokerHandDealtEvent> {
    const hands: Map<string, MinPokerHandDealtEvent> = new Map<string, MinPokerHandDealtEvent>();
    for (const player of match.players) {
      if (player && player.hand.length > 0) {
        hands.set(player.id, MinPokerDomainMapper.domainToHandDealtEvent(player.hand));
      }
    }
    return hands;
  }

  private async findOrCreateMatch(matchId: string): Promise<MinPokerGame> {
    const cachedMatch: MinPokerGame | null = this.matchRepository.findOne(matchId);
    if (cachedMatch) {
      return cachedMatch;
    } else {
      const entity: MinPokerGameEntity = await this.gameRepository.findOne(matchId);
      const match: MinPokerGame = MinPokerEntityMapper.toDomain(entity);
      if (match.players.length !== match.tableSize) {
        match.players = Array.from({ length: match.tableSize }, () => null);
      }
      return this.matchRepository.save(match);
    }
  }

  private resolvePlayerId(clientSocket: Socket, playerId: string): string {
    const socketPlayerId: string | null = this.playerIdRepository.findOne(clientSocket.id) ?? clientSocket.data?.playerId ?? null;
    if (!socketPlayerId) {
      throw new ForbiddenException('Socket is not bound to a player');
    }

    if (playerId && playerId !== socketPlayerId) {
      throw new ForbiddenException('Player id mismatch');
    }

    return socketPlayerId;
  }
}
