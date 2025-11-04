import { Injectable } from '@nestjs/common';
import { MinRpsGameMapper } from '../mapper/minrps-game.mapper';
import { MinRpsGame } from '../models/domain/minrps-game';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';
import { MinRpsGameRepository } from '../repositories/minrps-game.repository';

@Injectable()
export class MinRpsMatchService {
  public readonly matches = new Map<string, MinRpsGame>();

  constructor(private readonly gameRepository: MinRpsGameRepository) {}

  public async addObserverToMatch(playerId: string, matchId: string): Promise<void> {
    const gameEntity: MinRpsGameEntity = await this.gameRepository.findById(matchId);
    const match: MinRpsGame | undefined = this.findById(matchId);
    if (match) {
      match.addObserver(playerId);
    } else {
      const newMatch: MinRpsGame = MinRpsGameMapper.toDomainFromEntity(gameEntity);
      newMatch.addObserver(playerId);
      this.saveById(matchId, newMatch);
    }
  }

  private findById(id: string): MinRpsGame | undefined {
    return this.matches.get(id);
  }

  private saveById(id: string, match: MinRpsGame): void {
    this.matches.set(id, match);
  }
}
