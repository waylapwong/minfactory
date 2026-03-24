import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';

export class MinPokerEntityMapper {
  public static entityToDomain(entity: MinPokerGameEntity): MinPokerGame {
    const domain: MinPokerGame = new MinPokerGame();

    domain.bigBlind = entity.bigBlind;
    domain.createdAt = entity.createdAt;
    domain.creatorId = entity.creator?.id ?? '';
    domain.id = entity.id;
    domain.name = entity.name;
    domain.smallBlind = entity.smallBlind;
    domain.tableSize = entity.tableSize;

    return domain;
  }
}
