import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../../core/logging/services/logger.service';
import { MinPokerGame } from '../models/domains/minpoker-game';

@Injectable()
export class MinPokerMatchRepository {
  private readonly logger: LoggerService = new LoggerService(MinPokerMatchRepository.name);

  /**
   * MATCH ID -> MATCH
   */
  private readonly matches: Map<string, MinPokerGame> = new Map<string, MinPokerGame>();

  public delete(id: string): void {
    this.logger.debug(`START delete(id: ${id})`);
    this.matches.delete(id);
    this.logger.debug(`END delete(...)`);
  }

  public findOne(id: string): MinPokerGame | null {
    this.logger.debug(`START findOne(id: ${id})`);
    const result = this.matches.get(id) ?? null;
    this.logger.debug(`END findOne(...)`);
    return result;
  }

  public save(match: MinPokerGame): MinPokerGame {
    this.logger.debug(`START save(match: ${match.id})`);
    this.matches.set(match.id, match);
    const result = this.matches.get(match.id) as MinPokerGame;
    this.logger.debug(`END save(...)`);
    return result;
  }
}
