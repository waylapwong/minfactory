import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerGameDto } from '../models/dtos/minpoker-game.dto';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';
import { MinPokerHandDealtEvent } from '../models/events/minpoker-hand-dealt.event';
import { MinPokerUpdatedEvent } from '../models/events/minpoker-updated.event';
import { MinFactoryUserEntity } from 'src/features/minfactory/models/entities/minfactory-user.entity';

export class MinPokerDomainMapper {
  public static domainToDto(domain: MinPokerGame): MinPokerGameDto {
    const dto: MinPokerGameDto = new MinPokerGameDto();

    dto.bigBlind = domain.bigBlind;
    dto.createdAt = domain.createdAt;
    dto.id = domain.id;
    dto.name = domain.name;
    dto.observerCount = domain.observers?.size ?? 0;
    dto.playerCount = domain.getPlayerCount();
    dto.smallBlind = domain.smallBlind;
    dto.tableSize = domain.tableSize;

    return dto;
  }

  public static domainToUpdatedEvent(domain: MinPokerGame): MinPokerUpdatedEvent {
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

  public static domainToHandDealtEvent(hand: string[]): MinPokerHandDealtEvent {
    const event: MinPokerHandDealtEvent = new MinPokerHandDealtEvent();
    event.hand = [...hand];
    return event;
  }

  public static domainToEntity(domain: MinPokerGame): MinPokerGameEntity {
    const entity: MinPokerGameEntity = new MinPokerGameEntity();

    entity.bigBlind = domain.bigBlind;
    if (domain.createdAt.getTime() !== new Date(0).getTime()) {
      entity.createdAt = domain.createdAt;
    }
    if (domain.creatorId && domain.creatorId !== '') {
      const creator: MinFactoryUserEntity = new MinFactoryUserEntity();
      creator.id = domain.creatorId;
      entity.creator = creator;
    }
    if (domain.id !== '') {
      entity.id = domain.id;
    }
    entity.name = domain.name;
    entity.smallBlind = domain.smallBlind;
    entity.tableSize = domain.tableSize;

    return entity;
  }
}
