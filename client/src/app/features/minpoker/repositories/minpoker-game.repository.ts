import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MinPokerApiService, MinPokerCreateGameDto, MinPokerGameDto } from '../../../core/generated';
import { LoggerService } from '../../../core/logging/services/logger.service';

@Injectable({
  providedIn: 'root',
})
export class MinPokerGameRepository {
  private readonly logger: LoggerService = new LoggerService(MinPokerGameRepository.name);

  constructor(private readonly apiService: MinPokerApiService) {}

  public async create(game: { name: string; isPublic: boolean }): Promise<MinPokerGameDto> {
    this.logger.debug(`START create(game: ${JSON.stringify(game)})`);
    try {
      const dto: MinPokerCreateGameDto = { name: game.name, isPublic: game.isPublic };
      return await firstValueFrom(this.apiService.createMinPokerGame(dto));
    } finally {
      this.logger.debug(`END create(...)`);
    }
  }

  public async delete(id: string): Promise<void> {
    this.logger.debug(`START delete(id: ${id})`);
    try {
      return await firstValueFrom(this.apiService.deleteMinPokerGame(id));
    } finally {
      this.logger.debug(`END delete(...)`);
    }
  }

  public async getAll(): Promise<MinPokerGameDto[]> {
    this.logger.debug(`START getAll()`);
    try {
      return await firstValueFrom(this.apiService.getAllMinPokerGames());
    } finally {
      this.logger.debug(`END getAll(...)`);
    }
  }
}
