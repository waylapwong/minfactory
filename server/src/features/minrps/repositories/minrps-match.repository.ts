import { Injectable } from '@nestjs/common';
import { MinRpsGame } from '../models/domains/minrps-game';

@Injectable()
export class MinRpsMatchRepository {
  // Match ID - Match
  private readonly matches: Map<string, MinRpsGame> = new Map<string, MinRpsGame>();

  public delete(id: string): void {
    this.matches.delete(id);
  }

  public findOne(id: string): MinRpsGame | null {
    return this.matches.get(id) ?? null;
  }

  public findOrCreate(id: string): MinRpsGame {
    let match: MinRpsGame | null = this.findOne(id);
    if (!match) {
      match = new MinRpsGame();
      match.id = id;
      this.save(match);
    }
    return match;
  }

  public save(match: MinRpsGame): MinRpsGame {
    this.matches.set(match.id, match);
    return this.findOne(match.id) as MinRpsGame;
  }
}
