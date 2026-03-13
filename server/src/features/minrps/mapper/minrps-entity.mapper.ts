import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';

export class MinRpsEntityMapper {
  public static entityToDomain(entity: MinRpsGameEntity): MinRpsGame {
    const domain: MinRpsGame = new MinRpsGame();

    domain.createdAt = entity.createdAt;
    domain.id = entity.id;
    domain.name = entity.name;

    return domain;
  }
}
