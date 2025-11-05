import { Injectable } from '@nestjs/common';
import { MinRpsGameMapper } from '../mapper/minrps-game.mapper';
import { MinRpsGame } from '../models/domain/minrps-game';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';
import { MinRpsGameRepository } from '../repositories/minrps-game.repository';
import { MatchRepository } from '../repositories/minrps-match.repository';

@Injectable()
export class MinRpsMatchService {
  constructor(
    private readonly gameRepository: MinRpsGameRepository,
    private readonly matchRepository: MatchRepository,
  ) {}

  public async addObserver(playerId: string, matchId: string): Promise<void> {
    const match: MinRpsGame | undefined = this.matchRepository.findById(matchId);
    if (match) {
      match.addObserver(playerId);
    } else {
      const gameEntity: MinRpsGameEntity = await this.gameRepository.findById(matchId);
      const game: MinRpsGame = MinRpsGameMapper.toDomainFromEntity(gameEntity);
      game.addObserver(playerId);
      this.matchRepository.save(matchId, game);
    }
  }
}
