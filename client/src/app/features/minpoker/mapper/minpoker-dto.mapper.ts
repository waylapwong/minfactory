import { MinPokerGameDto } from '../../../core/generated';
import { LoggerService } from '../../../core/logging/services/logger.service';
import { MinPokerGame } from '../models/domains/minpoker-game';

export class MinPokerDtoMapper {
  private static readonly logger: LoggerService = new LoggerService(MinPokerDtoMapper.name);

  public static toDomain(dto: MinPokerGameDto): MinPokerGame {
    MinPokerDtoMapper.logger.debug(`START toDomain(dto: ${JSON.stringify(dto)})`);
    try {
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
    } finally {
      MinPokerDtoMapper.logger.debug(`END toDomain(...)`);
    }
  }
}
