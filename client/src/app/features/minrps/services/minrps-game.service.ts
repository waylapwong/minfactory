import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MinRPSGameApiService, MinRpsGameResponseDto } from '../../../core/generated';
import { sleep } from '../../../shared/utils/sleep.util';
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
import { MinRpsGame } from '../models/domain/minrps-game';
import { MinRpsMove } from '../models/enums/minrps-move.enum';
import { MinRpsResult } from '../models/enums/minrps-result.enum';
import { MINRPS_SETTINGS } from '../settings/minrps.settings';

@Injectable({
  providedIn: 'root',
})
export class MinRpsGameService {
  private readonly game: WritableSignal<MinRpsGame> = signal(new MinRpsGame());
  private readonly games: WritableSignal<MinRpsGameResponseDto[]> = signal([]);

  public gamesList: Signal<MinRpsGameResponseDto[]> = computed(() => this.games());
  public message: WritableSignal<string> = signal(MINRPS_START_MESSAGE);
  public player1Move: Signal<MinRpsMove> = computed(() => this.game().player1Move);
  public player2Move: Signal<MinRpsMove> = computed(() => this.game().player2Move);
  public result: Signal<MinRpsResult> = computed(() => this.game().result);

  private abortController: AbortController | undefined = undefined;
  private gameRunning: boolean = false;

  constructor(private readonly gameApiService: MinRPSGameApiService) {}

  public async checkGameById(id: string): Promise<boolean> {
    try {
      const dto: MinRpsGameResponseDto = await firstValueFrom(this.gameApiService.getGame(id));
      return !!dto;
    } catch (error: unknown) {
      console.error(error);
      return false;
    }
  }

  public async createNewGame(name: string): Promise<void> {
    await firstValueFrom(this.gameApiService.createGame({ name }));
    this.getAllGames();
  }

  public async deleteGameById(id: string): Promise<void> {
    await firstValueFrom(this.gameApiService.deleteGame(id));
    await this.getAllGames();
  }

  public async getAllGames(): Promise<void> {
    const dtos: MinRpsGameResponseDto[] = await firstValueFrom(this.gameApiService.getAllGames());
    this.games.set(dtos);
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
