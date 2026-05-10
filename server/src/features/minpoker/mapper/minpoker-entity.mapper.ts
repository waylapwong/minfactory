import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';

export class MinPokerEntityMapper {
  public static toDomain(entity: MinPokerGameEntity): MinPokerGame {
    const domain: MinPokerGame = new MinPokerGame();

    domain.bigBlind = entity.bigBlind;
    domain.isPublic = entity.isPublic;
    domain.name = entity.name;
    domain.smallBlind = entity.smallBlind;
    domain.tableSize = entity.tableSize;
    domain.createdAt = entity.createdAt;
    domain.creatorId = entity.creator.id;
    domain.id = entity.id;

    return domain;
  }
}
