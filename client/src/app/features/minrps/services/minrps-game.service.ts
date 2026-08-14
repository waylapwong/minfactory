import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { MinRpsErrorDto, MinRpsGameDto } from '../../../core/generated';
import { LoggerService } from '../../../core/logging/services/logger.service';
import { MinRpsDomainMapper } from '../mapper/minrps-domain.mapper';
import { MinRpsDtoMapper } from '../mapper/minrps-dto.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsOverviewViewModel } from '../models/viewmodels/minrps-overview.viewmodel';
import { MinRpsGameRepository } from '../repositories/minrps-game.repository';

@Injectable({
  providedIn: 'root',
})
export class MinRpsGameService {
  private readonly cachedGames: WritableSignal<MinRpsGame[]> = signal([]);
  private readonly logger: LoggerService = new LoggerService('MinRpsGameService');

  public games: Signal<MinRpsOverviewViewModel[]> = computed(() => this.cachedGames().map(MinRpsDomainMapper.domainToOverviewViewModel));

  constructor(private readonly gameRepository: MinRpsGameRepository) {}

  public async createGame(name: string): Promise<void> {
    const dto: MinRpsGameDto = await this.gameRepository.create(name);
    const domain: MinRpsGame = MinRpsDtoMapper.gameDtoToDomain(dto);
    this.cachedGames.update((games: MinRpsGame[]) =>
      [...games, domain].sort((a: MinRpsGame, b: MinRpsGame) => b.createdAt.getTime() - a.createdAt.getTime()),
    );
  }

  public async deleteGame(id: string): Promise<void> {
    try {
      await this.gameRepository.delete(id);
    } catch (error: unknown) {
      if (!this.handleHttpError(error, id)) {
        throw error;
      }
    }
    this.cachedGames.update((games: MinRpsGame[]) =>
      games
        .filter((game: MinRpsGame) => game.id !== id)
        .sort((a: MinRpsGame, b: MinRpsGame) => b.createdAt.getTime() - a.createdAt.getTime()),
    );
  }

  public async gameExistByID(id: string): Promise<boolean> {
    try {
      const dto: MinRpsGameDto = await this.gameRepository.get(id);
      return !!dto;
    } catch (error: unknown) {
      if (this.handleHttpError(error, id)) {
        return false;
      }
      throw error;
    }
  }

  public async refreshGames(): Promise<void> {
    const dtos: MinRpsGameDto[] = await this.gameRepository.getAll();
    const domains: MinRpsGame[] = dtos.map(MinRpsDtoMapper.gameDtoToDomain);
    this.cachedGames.set(domains);
  }

  private handleHttpError(error: unknown, id: string): boolean {
    if (!(error instanceof HttpErrorResponse)) {
      return false;
    }
    if (!this.isMinRpsErrorDto(error.error)) {
      return false;
    }
    if (error.error.statusCode !== HttpStatusCode.NotFound) {
      return false;
    }
    this.logger.error(`Game with ID ${id} does not exist.`);
    return true;
  }

  private isMinRpsErrorDto(error: unknown): error is MinRpsErrorDto {
    return typeof error === 'object' && error !== null && 'statusCode' in error && typeof (error as MinRpsErrorDto).statusCode === 'number';
  }
}
