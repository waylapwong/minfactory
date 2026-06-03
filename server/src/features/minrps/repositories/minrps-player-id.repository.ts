import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../../core/logging/services/logger.service';

@Injectable()
export class MinRpsPlayerIdRepository {
  private readonly logger: LoggerService = new LoggerService(MinRpsPlayerIdRepository.name);

  // Socket ID - Player ID
  private readonly players: Map<string, string> = new Map();

  public delete(socketId: string): void {
    this.logger.debug(`START delete(socketId: ${socketId})`);
    this.players.delete(socketId);
    this.logger.debug(`END delete(...)`);
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
