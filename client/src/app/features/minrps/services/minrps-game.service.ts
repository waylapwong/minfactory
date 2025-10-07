import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';

import {
  MINRPS_FIRST_MESSAGES,
  MINRPS_NEXT_MESSAGE,
  MINRPS_SECOND_MESSAGES,
  MINRPS_START_MESSAGE,
  MINRPS_THIRD_MESSAGES_PAPER,
  MINRPS_THIRD_MESSAGES_ROCK,
  MINRPS_THIRD_MESSAGES_SCISSORS,
} from '../messages/minrps-chat.message';
import { MinRPSPlayer } from '../models/domain/minprs-player';
import { MinRPSGame } from '../models/domain/minrps-game';
import { MinRPSMove } from '../models/enums/minrps-move.enum';
import { MinRPSResult } from '../models/enums/minrps-result.enum';
import { MinRPSGameComponent } from '../pages/minrps-game/minrps-game.component';

@Injectable({
  providedIn: 'root',
})
export class MinRPSGameService {
  public game: WritableSignal<MinRPSGame> = signal(new MinRPSGame());
  public gameResult: Signal<MinRPSResult> = computed(() => this.updateGameResult());
  public message: WritableSignal<string> = signal(MINRPS_START_MESSAGE);
  public player1Move: WritableSignal<MinRPSMove> = signal(MinRPSMove.None);
  public player1MovePreview: WritableSignal<MinRPSMove> = signal(MinRPSMove.None);
  public player2Move: WritableSignal<MinRPSMove> = signal(MinRPSMove.None);
  public player2MovePreview: WritableSignal<MinRPSMove> = signal(MinRPSMove.None);

  public setPlayer1Move(move: MinRPSMove): void {
    const game: MinRPSGame = this.game();
    game.getPlayer1().move = move;
    this.game.set(game);
  }

  public startGame(): void {
    const game: MinRPSGame = new MinRPSGame();
    game.setPlayer1(new MinRPSPlayer());
    game.setPlayer2(new MinRPSPlayer());
    this.game.set(game);
  }

  public startGameLoop(): void {
    this.player1Move.set(this.player1MovePreview());
    // this.setPlayer1Move(this.player1MovePreview());

    const moves: MinRPSMove[] = [MinRPSMove.Rock, MinRPSMove.Paper, MinRPSMove.Scissors];
    const opponentMove = moves[Math.floor(Math.random() * moves.length)];
    this.player2MovePreview.set(opponentMove);

    let finalMessage = '';
    switch (opponentMove) {
      case MinRPSMove.Rock:
        finalMessage =
          MINRPS_THIRD_MESSAGES_ROCK[Math.floor(Math.random() * MINRPS_THIRD_MESSAGES_ROCK.length)];
        break;
      case MinRPSMove.Paper:
        finalMessage =
          MINRPS_THIRD_MESSAGES_PAPER[
            Math.floor(Math.random() * MINRPS_THIRD_MESSAGES_PAPER.length)
          ];
        break;
      case MinRPSMove.Scissors:
        finalMessage =
          MINRPS_THIRD_MESSAGES_SCISSORS[
            Math.floor(Math.random() * MINRPS_THIRD_MESSAGES_SCISSORS.length)
          ];
        break;
    }

    const messages = [
      MINRPS_FIRST_MESSAGES[Math.floor(Math.random() * MINRPS_FIRST_MESSAGES.length)],
      MINRPS_SECOND_MESSAGES[Math.floor(Math.random() * MINRPS_SECOND_MESSAGES.length)],
      finalMessage,
    ];

    messages.forEach((message, index) => {
      setTimeout(
        () => this.writeMessage(message),
        index * MinRPSGameComponent.SINGLE_MESSAGE_DURATION,
      );
    });

    setTimeout(() => {
      this.player2Move.set(opponentMove);
    }, MinRPSGameComponent.TOTAL_MESSAGE_DURATION);

    setTimeout(() => {
      this.player1Move.set(MinRPSMove.None);
      this.player1MovePreview.set(MinRPSMove.None);
      this.player2Move.set(MinRPSMove.None);
      this.player2MovePreview.set(MinRPSMove.None);
      this.message.set(MINRPS_NEXT_MESSAGE);
    }, MinRPSGameComponent.GAME_ROUND_DURATION);
  }

  private updateGameResult(): MinRPSResult {
    const playerMove = this.player1Move();
    const opponentMove = this.player2Move();
    if (playerMove === MinRPSMove.None || opponentMove === MinRPSMove.None) {
      return MinRPSResult.None;
    }
    if (playerMove === opponentMove) {
      return MinRPSResult.Draw;
    }
    const playerWins: boolean =
      (playerMove === MinRPSMove.Rock && opponentMove === MinRPSMove.Scissors) ||
      (playerMove === MinRPSMove.Paper && opponentMove === MinRPSMove.Rock) ||
      (playerMove === MinRPSMove.Scissors && opponentMove === MinRPSMove.Paper);

    return playerWins ? MinRPSResult.Win : MinRPSResult.Loss;
  }

  private writeMessage(message: string): void {
    this.message.set('&nbsp;');
    let index: number = 0;
    const interval: number = setInterval(() => {
      this.message.update((text: string) => text + message[index]);
      index++;
      if (index >= message.length) {
        clearInterval(interval);
      }
    }, 30);
  }
}
