import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerCreateGameDto } from '../models/dtos/minpoker-create-game.dto';

export class MinPokerDtoMapper {
  public static createDtoToDomain(dto: MinPokerCreateGameDto): MinPokerGame {
    const domain: MinPokerGame = new MinPokerGame();

    domain.name = dto.name;

    return domain;
  }
}
