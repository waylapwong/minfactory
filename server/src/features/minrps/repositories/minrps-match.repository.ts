import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../../core/logging/services/logger.service';
import { MinRpsGame } from '../models/domains/minrps-game';

@Injectable()
export class MinRpsMatchRepository {
  private readonly logger: LoggerService = new LoggerService(MinRpsMatchRepository.name);

  // Match ID - Match
  private readonly matches: Map<string, MinRpsGame> = new Map<string, MinRpsGame>();

  public delete(id: string): void {
    this.logger.debug(`START delete(id: ${id})`);
    this.matches.delete(id);
    this.logger.debug(`END delete(...)`);
  }

  public findOne(id: string): MinRpsGame | null {
    this.logger.debug(`START findOne(id: ${id})`);
    const result = this.matches.get(id) ?? null;
    this.logger.debug(`END findOne(...)`);
    return result;
  }

  public findOrCreate(id: string): MinRpsGame {
    this.logger.debug(`START findOrCreate(id: ${id})`);
    let match: MinRpsGame | null = this.matches.get(id) ?? null;
    if (!match) {
      match = new MinRpsGame();
      match.id = id;
      this.matches.set(match.id, match);
    }
    this.logger.debug(`END findOrCreate(...)`);
    return match;
  }

  public save(match: MinRpsGame): MinRpsGame {
    this.logger.debug(`START save(match: ${match.id})`);
    this.matches.set(match.id, match);
    const result = this.matches.get(match.id) as MinRpsGame;
    this.logger.debug(`END save(...)`);
    return result;
  }
}
