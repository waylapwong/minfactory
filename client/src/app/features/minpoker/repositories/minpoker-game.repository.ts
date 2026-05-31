import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MinPokerApiService, MinPokerCreateGameDto, MinPokerGameDto, MinPokerGameVisibility } from '../../../core/generated';
import { LoggerService } from '../../../core/logging/services/logger.service';

@Injectable({
  providedIn: 'root',
})
export class MinPokerGameRepository {
  private readonly logger: LoggerService = new LoggerService(MinPokerGameRepository.name);

  constructor(private readonly apiService: MinPokerApiService) {}

  public async create(name: string, visibility: MinPokerGameVisibility): Promise<MinPokerGameDto> {
    this.logger.debug(`START create(name: ${name}, visibility: ${visibility})`);
    try {
      const dto: MinPokerCreateGameDto = { name, visibility };
      return await firstValueFrom(this.apiService.createMinPokerGame('', dto));
    } finally {
      this.logger.debug(`END create(...)`);
    }
  }

  public async delete(id: string): Promise<void> {
    this.logger.debug(`START delete(id: ${id})`);
    try {
      return await firstValueFrom(this.apiService.deleteMinPokerGame('', id));
    } finally {
      this.logger.debug(`END delete(...)`);
    }
  }

  public async getAll(visibility: MinPokerGameVisibility): Promise<MinPokerGameDto[]> {
    this.logger.debug(`START getAll(visibility: ${visibility})`);
    try {
      return await firstValueFrom(this.apiService.getAllMinPokerGames('', visibility));
    } finally {
      this.logger.debug(`END getAll(...)`);
    }
  }
}
