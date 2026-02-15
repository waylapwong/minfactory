import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { MinRpsGameDto } from '../../../core/generated';
import { sleep } from '../../../shared/utils/sleep.util';
import { MinRpsDomainMapper } from '../mapper/minrps-domain.mapper';
import { MinRpsDtoMapper } from '../mapper/minrps-dto.mapper';
import { MINRPS_FIRST_MESSAGES } from '../models/constants/minrps-first.message';
import {
  MINRPS_FOURTH_MESSAGES_LOSE,
  MINRPS_FOURTH_MESSAGES_TIE,
  MINRPS_FOURTH_MESSAGES_WIN,
} from '../models/constants/minrps-fourth.message';
import { MINRPS_SECOND_MESSAGES } from '../models/constants/minrps-second.message';
import { MINRPS_START_MESSAGE } from '../models/constants/minrps-start.message';
import {
  MINRPS_THIRD_MESSAGES_PAPER,
  MINRPS_THIRD_MESSAGES_ROCK,
  MINRPS_THIRD_MESSAGES_SCISSORS,
} from '../models/constants/minrps-third.message';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsMove } from '../models/enums/minrps-move.enum';
import { MinRpsResult } from '../models/enums/minrps-result.enum';
import { MinRpsGameViewModel } from '../models/viewmodels/minrps-game.viewmodel';
import { MinRpsGameRepository } from '../repositories/minrps-game.repository';
import { MINRPS_SETTINGS } from '../settings/minrps.settings';

@Injectable({
  providedIn: 'root',
})
export class MinRpsGameService {
  private readonly cachedGames: WritableSignal<MinRpsGame[]> = signal([]);
  private readonly game: WritableSignal<MinRpsGame> = signal(new MinRpsGame());

  public games: Signal<MinRpsGameViewModel[]> = computed(() =>
    this.cachedGames().map(MinRpsDomainMapper.domainToViewModel),
  );
  public message: WritableSignal<string> = signal(MINRPS_START_MESSAGE);
  public player1Move: Signal<MinRpsMove> = computed(() => this.game().player1Move);
  public player2Move: Signal<MinRpsMove> = computed(() => this.game().player2Move);
  public result: Signal<MinRpsResult> = computed(() => this.game().result);

  private abortController: AbortController | undefined = undefined;
  private gameRunning: boolean = false;

  constructor(private readonly gameRepository: MinRpsGameRepository) {}

  public async createGame(name: string): Promise<void> {
    const dto: MinRpsGameDto = await this.gameRepository.create(name);
    const domain: MinRpsGame = MinRpsDtoMapper.dtoToDomain(dto);
    this.cachedGames.update((games: MinRpsGame[]) =>
      [...games, domain].sort(
        (a: MinRpsGame, b: MinRpsGame) => b.createdAt.getTime() - a.createdAt.getTime(),
      ),
    );
  }

  public async deleteGame(id: string): Promise<void> {
    await this.gameRepository.delete(id);
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
      console.error(error);
      return false;
    }
  }

  public async refreshGames(): Promise<void> {
    const dtos: MinRpsGameDto[] = await this.gameRepository.getAll();
    const domains: MinRpsGame[] = dtos.map(MinRpsDtoMapper.dtoToDomain);
    this.cachedGames.set(domains);
  }

  public setPlayer1Move(move: MinRpsMove): void {
    const newGame = new MinRpsGame({ ...this.game(), player1Move: move });
    this.game.set(newGame);
  }

  public setPlayer2Move(move: MinRpsMove): void {
    const newGame = new MinRpsGame({ ...this.game(), player2Move: move });
    this.game.set(newGame);
  }

  public setupNewGame(): void {
    const newGame: MinRpsGame = new MinRpsGame();
    this.game.set(newGame);
  }

  public async startGame(move: MinRpsMove): Promise<void> {
    if (this.gameRunning) {
      return;
    }
    this.gameRunning = true;

    try {
      this.setPlayer1Move(move);
      const player2Move = this.getRandomMove();
      const messages = this.getMessages(player2Move);

      await this.displayMessages(messages);
      await this.revealPlayer2Move(player2Move);

      switch (this.game().result) {
        case MinRpsResult.Player1:
          await this.typeMessage(this.getRandomMessage(MINRPS_FOURTH_MESSAGES_LOSE));
          break;
        case MinRpsResult.Player2:
          await this.typeMessage(this.getRandomMessage(MINRPS_FOURTH_MESSAGES_WIN));
          break;
        default:
          await this.typeMessage(this.getRandomMessage(MINRPS_FOURTH_MESSAGES_TIE));
          break;
      }
    } finally {
      this.setupNewGame();
      this.gameRunning = false;
    }
  }

  private abortTyping(): void {
    if (this.abortController && !this.abortController.signal.aborted) {
      this.abortController.abort();
    }
  }

  private async displayMessages(messages: string[]): Promise<void> {
    this.abortTyping();
    for (const message of messages) {
      this.abortController = new AbortController();
      await this.typeMessage(message, this.abortController.signal);
      await this.sleep(MINRPS_SETTINGS.MESSAGE_DELAY);
    }
    this.abortController = undefined;
  }

  private getMessages(move: MinRpsMove): string[] {
    const firstMessage = this.getRandomMessage(MINRPS_FIRST_MESSAGES);
    const secondMessage = this.getRandomMessage(MINRPS_SECOND_MESSAGES);

    let thirdMessage = '';
    switch (move) {
      case MinRpsMove.Rock:
        thirdMessage = this.getRandomMessage(MINRPS_THIRD_MESSAGES_ROCK);
        break;
      case MinRpsMove.Paper:
        thirdMessage = this.getRandomMessage(MINRPS_THIRD_MESSAGES_PAPER);
        break;
      case MinRpsMove.Scissors:
        thirdMessage = this.getRandomMessage(MINRPS_THIRD_MESSAGES_SCISSORS);
        break;
    }

    return [firstMessage, secondMessage, thirdMessage];
  }

  private getRandomMessage(messages: string[]): string {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getRandomMove(): MinRpsMove {
    const moves: MinRpsMove[] = [MinRpsMove.Rock, MinRpsMove.Paper, MinRpsMove.Scissors];
    return moves[Math.floor(Math.random() * moves.length)];
  }

  private async revealPlayer2Move(move: MinRpsMove): Promise<void> {
    this.setPlayer2Move(move);
    await this.sleep(MINRPS_SETTINGS.RESULT_DURATION);
  }

  private async sleep(ms: number): Promise<void> {
    await sleep(ms);
  }

  private async typeMessage(message: string, signal?: AbortSignal): Promise<void> {
    this.message.set('&nbsp;');
    for (const char of message) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      this.message.update((currentMessage) => currentMessage + char);
      await this.sleep(MINRPS_SETTINGS.TYPE_MESSAGE_SPEED);
    }
  }
}
