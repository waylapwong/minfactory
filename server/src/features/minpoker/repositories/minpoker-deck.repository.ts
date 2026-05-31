import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../../core/logging/services/logger.service';
import { MinPokerDeck } from '../models/domains/minpoker-deck';

@Injectable()
export class MinPokerDeckRepository {
  private readonly logger: LoggerService = new LoggerService(MinPokerDeckRepository.name);

  /**
   * MATCH ID -> DECK
   */
  private readonly decks: Map<string, MinPokerDeck> = new Map<string, MinPokerDeck>();

  public delete(matchId: string): void {
    this.logger.debug(`START delete(matchId: ${matchId})`);
    this.decks.delete(matchId);
    this.logger.debug(`END delete(...)`);
  }

  public findOne(matchId: string): MinPokerDeck | null {
    this.logger.debug(`START findOne(matchId: ${matchId})`);
    const result = this.decks.get(matchId) ?? null;
    this.logger.debug(`END findOne(...)`);
    return result;
  }

  public save(matchId: string, deck: MinPokerDeck): MinPokerDeck {
    this.logger.debug(`START save(matchId: ${matchId})`);
    this.decks.set(matchId, deck);
    const result = this.decks.get(matchId) as MinPokerDeck;
    this.logger.debug(`END save(...)`);
    return result;
  }
}
