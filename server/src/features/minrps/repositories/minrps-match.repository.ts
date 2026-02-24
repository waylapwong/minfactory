import { Injectable } from '@nestjs/common';
import { MinRpsGame } from '../models/domains/minrps-game';

@Injectable()
export class MinRpsMatchRepository {
  private readonly matches: Map<string, MinRpsGame> = new Map<string, MinRpsGame>();

  public delete(id: string): void {
    this.matches.delete(id);
  }

  public findOne(id: string): MinRpsGame | null {
    const match: MinRpsGame | undefined = this.matches.get(id);
    return match ?? null;
  }

  public save(match: MinRpsGame): MinRpsGame {
    this.matches.set(match.id, match);
    return this.findOne(match.id) as MinRpsGame;
  }
}
