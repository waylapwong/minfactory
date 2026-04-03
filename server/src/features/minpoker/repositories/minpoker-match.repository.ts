import { Injectable } from '@nestjs/common';
import { MinPokerGame } from '../models/domains/minpoker-game';

@Injectable()
export class MinPokerMatchRepository {
  private readonly matches: Map<string, MinPokerGame> = new Map<string, MinPokerGame>();

  public delete(id: string): void {
    this.matches.delete(id);
  }

  public findOne(id: string): MinPokerGame | null {
    return this.matches.get(id) ?? null;
  }

  public save(match: MinPokerGame): MinPokerGame {
    this.matches.set(match.id, match);
    return this.findOne(match.id) as MinPokerGame;
  }
}
