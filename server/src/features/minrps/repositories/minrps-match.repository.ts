import { Injectable } from '@nestjs/common';
import { MinRpsGame } from '../models/domains/minrps-game';

@Injectable()
export class MinRpsMatchRepository {
  private readonly matches = new Map<string, MinRpsGame>();

  public findOne(id: string): MinRpsGame | null {
    return this.matches.get(id) || null;
  }

  public save(id: string, match: MinRpsGame): void {
    this.matches.set(id, match);
  }
}
