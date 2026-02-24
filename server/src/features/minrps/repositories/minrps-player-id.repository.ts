import { Injectable } from '@nestjs/common';

@Injectable()
export class MinRpsPlayerIdRepository {
  // Socket ID - Player ID
  private readonly players: Map<string, string> = new Map();

  public delete(socketId: string): void {
    this.players.delete(socketId);
  }

  public findOne(socketId: string): string | null {
    return this.players.get(socketId) ?? null;
  }

  public save(socketId: string, playerId: string): void {
    this.players.set(socketId, playerId);
  }
}
