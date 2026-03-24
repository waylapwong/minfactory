import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { MinPokerGameDto } from '../../../core/generated';
import { MinPokerDomainMapper } from '../mapper/minpoker-domain.mapper';
import { MinPokerDtoMapper } from '../mapper/minpoker-dto.mapper';
import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerLobbyViewModel } from '../models/viewmodels/minpoker-lobby.viewmodel';
import { MinPokerGameRepository } from '../repositories/minpoker-game.repository';

@Injectable({
  providedIn: 'root',
})
export class MinPokerGameService {
  private readonly cachedPokerGames: WritableSignal<MinPokerGame[]> = signal([]);

  public lobbyViewModels: Signal<MinPokerLobbyViewModel[]> = computed(() =>
    this.cachedPokerGames().map(MinPokerDomainMapper.domainToLobbyViewModel),
  );

  constructor(private readonly gameRepository: MinPokerGameRepository) {}

  public async loadGames(): Promise<void> {
    // Get DTOs
    const dtos: MinPokerGameDto[] = await this.gameRepository.getAll();
    // Map to Domains and sort by Date
    const domains: MinPokerGame[] = dtos
      .map(MinPokerDtoMapper.gameDtoToDomain)
      .sort((a: MinPokerGame, b: MinPokerGame) => b.createdAt.getTime() - a.createdAt.getTime());
    // Cache Domains
    this.cachedPokerGames.set(domains);
  }
}
