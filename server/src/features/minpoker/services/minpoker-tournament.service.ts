import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Socket } from 'socket.io';
import { MinPokerDomainMapper } from '../mapper/minpoker-domain.mapper';
import { MinPokerEntityMapper } from '../mapper/minpoker-entity.mapper';
import { MinPokerJoinCommand } from '../models/commands/minpoker-join.command';
import { MinPokerSeatCommand } from '../models/commands/minpoker-seat.command';
import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerPlayer } from '../models/domains/minpoker-player';
import { MinPokerConnectedEvent } from '../models/events/minpoker-connected.event';
import { MinPokerDisconnectedEvent } from '../models/events/minpoker-disconnected.event';
import { MinPokerUpdatedEvent } from '../models/events/minpoker-updated.event';
import { MinPokerGameRepository } from '../repositories/minpoker-game.repository';
import { MinPokerMatchRepository } from '../repositories/minpoker-match.repository';
import { MinPokerPlayerIdRepository } from '../repositories/minpoker-player-id.repository';
import { MinPokerRoomSystem } from '../systems/minpoker-room.system';

@Injectable()
export class MinPokerTournamentService {
  constructor(
    private readonly gameRepository: MinPokerGameRepository,
    private readonly matchRepository: MinPokerMatchRepository,
    private readonly playerIdRepository: MinPokerPlayerIdRepository,
    private readonly roomSystem: MinPokerRoomSystem,
  ) {}

  public handleConnection(client: Socket): MinPokerConnectedEvent {
    const event: MinPokerConnectedEvent = new MinPokerConnectedEvent();
    event.playerId = randomUUID();
    client.data.playerId = event.playerId;
    this.playerIdRepository.save(client.id, event.playerId);
    return event;
  }

  public handleDisconnect(
    client: Socket,
  ): { disconnectedEvent: MinPokerDisconnectedEvent; updatedEvent: MinPokerUpdatedEvent | null } | null {
    const playerId: string | null = this.playerIdRepository.findOne(client.id) ?? client.data?.playerId ?? null;
    const matchId: string | null = this.roomSystem.getPlayerRoomName(client);

    if (!playerId) {
      return null;
    }

    const event: MinPokerDisconnectedEvent = new MinPokerDisconnectedEvent();
    event.playerId = playerId;
    event.matchId = matchId;

    let updatedEvent: MinPokerUpdatedEvent | null = null;
    if (matchId) {
      const match: MinPokerGame | null = this.matchRepository.findOne(matchId);
      if (match) {
        match.removePlayer(playerId);
        if (match.hasParticipants()) {
          this.matchRepository.save(match);
          updatedEvent = MinPokerDomainMapper.domainToUpdatedEvent(match);
        } else {
          this.matchRepository.delete(match.id);
        }
      }
      this.roomSystem.removePlayerFromRoom(client, matchId);
    }

    this.playerIdRepository.delete(client.id);
    return { disconnectedEvent: event, updatedEvent };
  }

  public async joinMatch(client: Socket, command: MinPokerJoinCommand): Promise<MinPokerUpdatedEvent> {
    this.roomSystem.addPlayerToRoom(client, command.matchId);
    const match: MinPokerGame = await this.findOrCreateMatch(command.matchId);
    match.addObserver(command.playerId);
    const updatedMatch: MinPokerGame = this.matchRepository.save(match);
    return MinPokerDomainMapper.domainToUpdatedEvent(updatedMatch);
  }

  public async seatPlayer(command: MinPokerSeatCommand): Promise<MinPokerUpdatedEvent> {
    const match: MinPokerGame = await this.findOrCreateMatch(command.matchId);
    const player: MinPokerPlayer = new MinPokerPlayer({
      avatar: command.avatar,
      id: command.playerId,
      name: command.playerName,
    });

    match.seatPlayer(player, command.seat);
    const updatedMatch: MinPokerGame = this.matchRepository.save(match);
    return MinPokerDomainMapper.domainToUpdatedEvent(updatedMatch);
  }

  private async findOrCreateMatch(matchId: string): Promise<MinPokerGame> {
    const cachedMatch: MinPokerGame | null = this.matchRepository.findOne(matchId);
    if (cachedMatch) {
      return cachedMatch;
    }

    const entity = await this.gameRepository.findOne(matchId);
    const match: MinPokerGame = MinPokerEntityMapper.entityToDomain(entity);
    if (match.players.length !== match.tableSize) {
      match.players = Array.from({ length: match.tableSize }, () => null);
    }

    return this.matchRepository.save(match);
  }
}
