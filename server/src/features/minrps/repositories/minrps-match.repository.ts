import { Injectable } from '@nestjs/common';
import { MinRpsGame } from '../models/domain/minrps-game';

@Injectable()
export class MatchRepository {
  public readonly matches = new Map<string, MinRpsGame>();

  public findById(id: string): MinRpsGame | undefined {
    return this.matches.get(id);
  }

  public save(id: string, match: MinRpsGame): void {
    this.matches.set(id, match);
  }
}
