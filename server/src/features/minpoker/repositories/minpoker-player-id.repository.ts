import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../../core/logging/services/logger.service';

@Injectable()
export class MinPokerPlayerIdRepository {
  private readonly logger: LoggerService = new LoggerService(MinPokerPlayerIdRepository.name);

  /**
   * SOCKET ID -> PLAYER ID
   */
  private readonly players: Map<string, string> = new Map<string, string>();

  public delete(socketId: string): void {
    this.logger.debug(`START delete(socketId: ${socketId})`);
    this.players.delete(socketId);
    this.logger.debug(`END delete(...)`);
  }

  public findByPlayerId(playerId: string): string | null {
    this.logger.debug(`START findByPlayerId(playerId: ${playerId})`);
    for (const [socketId, id] of this.players) {
      if (id === playerId) {
        this.logger.debug(`END findByPlayerId(...)`);
        return socketId;
      }
    }
    this.logger.debug(`END findByPlayerId(...)`);
    return null;
  }

  public findOne(socketId: string): string | null {
    this.logger.debug(`START findOne(socketId: ${socketId})`);
    const result = this.players.get(socketId) ?? null;
    this.logger.debug(`END findOne(...)`);
    return result;
  }

  public save(socketId: string, playerId: string): void {
    this.logger.debug(`START save(socketId: ${socketId}, playerId: ${playerId})`);
    this.players.set(socketId, playerId);
    this.logger.debug(`END save(...)`);
  }
}
