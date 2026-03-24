import { MinPokerGameDto } from '../../../core/generated';
import { MinPokerGame } from '../models/domains/minpoker-game';

export class MinPokerDtoMapper {
  public static gameDtoToDomain(dto: MinPokerGameDto): MinPokerGame {
    const domain: MinPokerGame = new MinPokerGame();

    domain.bigBlind = dto.bigBlind;
    domain.createdAt = new Date(dto.createdAt);
    domain.id = dto.id;
    domain.name = dto.name;
    domain.observerCount = dto.observerCount;
    domain.playerCount = dto.playerCount;
    domain.smallBlind = dto.smallBlind;
    domain.tableSize = dto.tableSize;

    return domain;
  }
}
