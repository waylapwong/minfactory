import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';

export class MinPokerEntityMapper {
  public static entityToDomain(entity: MinPokerGameEntity): MinPokerGame {
    const domain: MinPokerGame = new MinPokerGame();

    domain.bigBlind = entity.bigBlind;
    domain.createdAt = entity.createdAt;
    domain.id = entity.id;
    domain.name = entity.name;
    domain.smallBlind = entity.smallBlind;
    domain.creatorId = entity.creator && entity.creator.id ? entity.creator.id : '';

    return domain;
  }
}
