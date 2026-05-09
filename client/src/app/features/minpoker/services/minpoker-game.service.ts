import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { MinPokerGameDto } from '../../../core/generated';
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

  public publicGamesVm: Signal<MinPokerPublicGamesVm> = computed(() => MinPokerDomainMapper.toPublicGamesVm(this.cachedPokerGames()));

  constructor(private readonly gameRepository: MinPokerGameRepository) {}

  public async createGame(name: string): Promise<void> {
    const dto: MinPokerGameDto = await this.gameRepository.create({ name });
    const domain: MinPokerGame = MinPokerDtoMapper.toDomain(dto);
    this.cachedPokerGames.update((games: MinPokerGame[]) =>
      [domain, ...games].sort((a: MinPokerGame, b: MinPokerGame) => b.createdAt.getTime() - a.createdAt.getTime()),
    );
  }

  public async deleteGame(id: string): Promise<void> {
    await this.gameRepository.delete(id);
    this.cachedPokerGames.update((games: MinPokerGame[]) =>
      games
        .filter((game: MinPokerGame) => game.id !== id)
        .sort((a: MinPokerGame, b: MinPokerGame) => b.createdAt.getTime() - a.createdAt.getTime()),
    );
  }

  public async loadGames(): Promise<void> {
    // Get DTOs
    const dtos: MinPokerGameDto[] = await this.gameRepository.getAll();
    // Map to Domains and sort by Date
    const domains: MinPokerGame[] = dtos
      .map(MinPokerDtoMapper.toDomain)
      .sort((a: MinPokerGame, b: MinPokerGame) => b.createdAt.getTime() - a.createdAt.getTime());
    // Cache Domains
    this.cachedPokerGames.set(domains);
  }
}
