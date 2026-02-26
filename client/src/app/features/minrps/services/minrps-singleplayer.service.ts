import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { MinRpsMove, MinRpsPlayDto, MinRpsPlayResultDto } from '../../../core/generated';
import { MinRpsDomainMapper } from '../mapper/minrps-domain.mapper';
import { MinRpsDtoMapper } from '../mapper/minrps-dto.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsSingleplayerViewModel } from '../models/viewmodels/minrps-singleplayer.viewmodel';
import { MinRpsPlayRepository } from '../repositories/minrps-play.repository';

@Injectable({
  providedIn: 'root',
})
export class MinRpsSingleplayerService {
  private readonly PUFFER_TIME = 2000;
  private readonly cachedGame: WritableSignal<MinRpsGame> = signal(new MinRpsGame());

  public game: Signal<MinRpsSingleplayerViewModel> = computed(() =>
    MinRpsDomainMapper.domainToSingleplayerViewModel(this.cachedGame()),
  );

  constructor(private readonly playRepository: MinRpsPlayRepository) {}

  public async playGame(): Promise<void> {
    // Set player 1 move
    const newGame: MinRpsGame = new MinRpsGame(this.cachedGame());
    newGame.player1.move = newGame.player1.selectedMove;
    this.cachedGame.set(newGame);
    // Build DTO
    const playDto: MinRpsPlayDto = MinRpsDomainMapper.domainToPlayDto(this.cachedGame());
    // Make request
    const playResultDto: MinRpsPlayResultDto = await this.playRepository.play(playDto);
    const playResultDomain: MinRpsGame = MinRpsDtoMapper.playResultDtoToDomain(playResultDto);
    // Update game state
    this.cachedGame.set(playResultDomain);
    // Reset game after PUFFER_TIME
    setTimeout(() => {
      this.setupNewGame();
    }, this.PUFFER_TIME);
  }

  public selectMove(move: MinRpsMove): void {
    const newGame: MinRpsGame = new MinRpsGame(this.cachedGame());
    newGame.player1.selectedMove = move;
    this.cachedGame.set(newGame);
  }

  public setupNewGame(): void {
    this.cachedGame.set(new MinRpsGame());
  }
}
