import { Injectable } from '@nestjs/common';
import { MinPokerDeck } from '../models/domains/minpoker-deck';

@Injectable()
export class MinPokerDeckRepository {
  private readonly decks: Map<string, MinPokerDeck> = new Map<string, MinPokerDeck>();

  public delete(matchId: string): void {
    this.decks.delete(matchId);
  }

  public findOne(matchId: string): MinPokerDeck | null {
    return this.decks.get(matchId) ?? null;
  }

  public save(matchId: string, deck: MinPokerDeck): MinPokerDeck {
    this.decks.set(matchId, deck);
    return this.findOne(matchId) as MinPokerDeck;
  }
}
