import { Injectable } from '@nestjs/common';
import { MinRpsEntityMapper } from '../mapper/minrps-entity.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';
import { MinRpsGameRepository } from '../repositories/minrps-game.repository';
import { MinRpsMatchRepository } from '../repositories/minrps-match.repository';

@Injectable()
export class MinRpsGameSessionService {
  constructor(
    private readonly gameRepository: MinRpsGameRepository,
    private readonly matchRepository: MinRpsMatchRepository,
  ) {}

  public async addObserver(playerId: string, matchId: string): Promise<void> {
    const match: MinRpsGame | undefined = this.matchRepository.findById(matchId);
    if (match) {
      match.addObserver();
    } else {
      const gameEntity: MinRpsGameEntity = await this.gameRepository.findOne(matchId);
      const game: MinRpsGame = MinRpsEntityMapper.entityToDomain(gameEntity);
      game.addObserver();
      this.matchRepository.save(matchId, game);
    }
  }
}
