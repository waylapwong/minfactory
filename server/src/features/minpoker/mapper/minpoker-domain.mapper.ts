import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerGameDto } from '../models/dtos/minpoker-game.dto';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';
import { MinFactoryUserEntity } from 'src/features/minfactory/models/entities/minfactory-user.entity';

export class MinPokerDomainMapper {
  public static domainToDto(domain: MinPokerGame): MinPokerGameDto {
    const dto: MinPokerGameDto = new MinPokerGameDto();

    dto.bigBlind = domain.bigBlind;
    dto.createdAt = domain.createdAt;
    dto.creatorId = domain.creatorId;
    dto.id = domain.id;
    dto.name = domain.name;
    dto.observerCount = 0;
    dto.playerCount = domain.players ? domain.players.filter((p) => p && p.id !== '').length : 0;
    dto.smallBlind = domain.smallBlind;
    dto.tableSize = 6;

    return dto;
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
