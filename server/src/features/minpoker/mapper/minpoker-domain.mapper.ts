import { MinFactoryUserEntity } from '../../minfactory/models/entities/minfactory-user.entity';
import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerGameDto } from '../models/dtos/minpoker-game.dto';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';
import { MinPokerHandDealtEvent } from '../models/events/minpoker-hand-dealt.event';
import { MinPokerUpdatedEvent } from '../models/events/minpoker-updated.event';

export class MinPokerDomainMapper {
  public static toDto(domain: MinPokerGame): MinPokerGameDto {
    const dto: MinPokerGameDto = new MinPokerGameDto();

    dto.bigBlind = domain.bigBlind;
    dto.createdAt = domain.createdAt;
    dto.creatorId = domain.creatorId;
    dto.id = domain.id;
    dto.isPublic = domain.isPublic;
    dto.name = domain.name;
    dto.observerCount = domain.observers?.size ?? 0;
    dto.playerCount = domain.getPlayerCount();
    dto.smallBlind = domain.smallBlind;
    dto.tableSize = domain.tableSize;

    return dto;
  }

  public static toEntity(domain: MinPokerGame): MinPokerGameEntity {
    const entity: MinPokerGameEntity = new MinPokerGameEntity();

    entity.bigBlind = domain.bigBlind;
    entity.createdAt = domain.createdAt;
    if (domain.creatorId) {
      const creator: MinFactoryUserEntity = new MinFactoryUserEntity();
      creator.id = domain.creatorId;
      entity.creator = creator;
    }
    entity.id = domain.id;
    entity.isPublic = domain.isPublic;
    entity.name = domain.name;
    entity.smallBlind = domain.smallBlind;
    entity.tableSize = domain.tableSize;

    return entity;
  }

  public static toHandDealtEvent(hand: string[]): MinPokerHandDealtEvent {
    const event: MinPokerHandDealtEvent = new MinPokerHandDealtEvent();
    event.hand = [...hand];
    return event;
  }

  public static toUpdatedEvent(domain: MinPokerGame): MinPokerUpdatedEvent {
    const event: MinPokerUpdatedEvent = new MinPokerUpdatedEvent();

    event.bigBlind = domain.bigBlind;
    event.matchId = domain.id;
    event.name = domain.name;
    event.observerIds = [...domain.observers.keys()];
    event.players = domain.players
      .filter((player): player is NonNullable<typeof player> => player !== null)
      .map((player) => ({
        avatar: player.avatar,
        id: player.id,
        name: player.name,
        seat: player.seat,
        stack: player.stack,
      }));
    event.smallBlind = domain.smallBlind;
    event.tableSize = domain.tableSize;

    return event;
  }
}
