import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { MinPokerGameDto, MinPokerGameVisibility } from '../../../core/generated';
import { LoggerService } from '../../../core/logging/services/logger.service';
import { MinPokerDomainMapper } from '../mapper/minpoker-domain.mapper';
import { MinPokerDtoMapper } from '../mapper/minpoker-dto.mapper';
import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerPublicGamesVm } from '../models/viewmodels/minpoker-public-games.vm';
import { MinPokerGameRepository } from '../repositories/minpoker-game.repository';

@Injectable({
  providedIn: 'root',
})
export class MinPokerGameService {
  private readonly cachedPokerGames: WritableSignal<MinPokerGame[]> = signal([]);
  private readonly logger: LoggerService = new LoggerService(MinPokerGameService.name);

  public publicGamesVm: Signal<MinPokerPublicGamesVm> = computed(() => MinPokerDomainMapper.toPublicGamesVm(this.cachedPokerGames()));

  constructor(private readonly gameRepository: MinPokerGameRepository) {}

  public async createGame(name: string, visibility: MinPokerGameVisibility): Promise<void> {
    this.logger.debug(`START createGame(name: ${name}, visibility: ${visibility})`);
    try {
      const dto: MinPokerGameDto = await this.gameRepository.create(name, visibility);
      const domain: MinPokerGame = MinPokerDtoMapper.toDomain(dto);
      this.cachedPokerGames.update((games: MinPokerGame[]) =>
        [domain, ...games].sort((a: MinPokerGame, b: MinPokerGame) => b.createdAt.getTime() - a.createdAt.getTime()),
      );
    } finally {
      this.logger.debug(`END createGame(...)`);
    }
  }

  public async deleteGame(id: string): Promise<void> {
    this.logger.debug(`START deleteGame(id: ${id})`);
    try {
      await this.gameRepository.delete(id);
      this.cachedPokerGames.update((games: MinPokerGame[]) =>
        games
          .filter((game: MinPokerGame) => game.id !== id)
          .sort((a: MinPokerGame, b: MinPokerGame) => b.createdAt.getTime() - a.createdAt.getTime()),
      );
    } finally {
      this.logger.debug(`END deleteGame(...)`);
    }
  }

  public async loadGames(visibility: MinPokerGameVisibility): Promise<void> {
    this.logger.debug(`START loadGames(visibility: ${visibility})`);
    try {
      // Get DTOs
      const dtos: MinPokerGameDto[] = await this.gameRepository.getAll(visibility);
      // Map to Domains and sort by Date
      const domains: MinPokerGame[] = dtos
        .map(MinPokerDtoMapper.toDomain)
        .sort((a: MinPokerGame, b: MinPokerGame) => b.createdAt.getTime() - a.createdAt.getTime());
      // Cache Domains
      this.cachedPokerGames.set(domains);
    } finally {
      this.logger.debug(`END loadGames(...)`);
    }
  }
}
