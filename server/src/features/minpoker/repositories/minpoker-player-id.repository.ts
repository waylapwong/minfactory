import { Injectable } from '@nestjs/common';

@Injectable()
export class MinPokerPlayerIdRepository {
  private readonly players: Map<string, string> = new Map<string, string>();

  public delete(socketId: string): void {
    this.players.delete(socketId);
  }

  public findOne(socketId: string): string | null {
    return this.players.get(socketId) ?? null;
  }

  public findByPlayerId(playerId: string): string | null {
    for (const [socketId, id] of this.players) {
      if (id === playerId) {
        return socketId;
      }
    }
    return null;
  }

  public save(socketId: string, playerId: string): void {
    this.players.set(socketId, playerId);
  }
}
