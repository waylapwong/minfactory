import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerCreateGameDto } from '../models/dtos/minpoker-create-game.dto';

export class MinPokerDtoMapper {
  public static toDomain(dto: MinPokerCreateGameDto): MinPokerGame {
    const domain: MinPokerGame = new MinPokerGame();

    domain.visibility = dto.visibility;
    domain.name = dto.name;

    return domain;
  }
}
