import { MinRpsGameDto } from '../../../core/generated';
import { MinRpsGame } from '../models/domains/minrps-game';

export class MinRpsDtoMapper {
  public static dtoToDomain(dto: MinRpsGameDto): MinRpsGame {
    const domain: MinRpsGame = new MinRpsGame();

    domain.createdAt = new Date(dto.createdAt);
    domain.id = dto.id;
    domain.name = dto.name;
    domain.observerCount = dto.observerCount;
    domain.playerCount = dto.playerCount;

    return domain;
  }
}
