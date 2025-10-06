import { Component, Signal, WritableSignal, computed, signal } from '@angular/core';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DividerComponent } from '../../../../shared/components/divider/divider.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRPSCardComponent } from '../../components/minrps-card/minrps-card.component';
import { MinRPSMoveComponent } from '../../components/minrps-move/minrps-move.component';
import { MinRPSGameResult } from '../../enums/minrps-game-result.enum';
import { MinRPSMove } from '../../enums/minrps-move.enum';
import {
  MINRPS_FIRST_MESSAGES,
  MINRPS_NEXT_MESSAGE,
  MINRPS_SECOND_MESSAGES,
  MINRPS_START_MESSAGE,
  MINRPS_THIRD_MESSAGES_PAPER,
  MINRPS_THIRD_MESSAGES_ROCK,
  MINRPS_THIRD_MESSAGES_SCISSORS,
} from '../../messages/minrps-chat.message';

@Component({
  selector: 'minrps-game',
  templateUrl: './minrps-game.component.html',
  styleUrls: ['./minrps-game.component.scss'],
  host: { class: 'block h-full' },
  imports: [ButtonComponent, DividerComponent, MinRPSMoveComponent, MinRPSCardComponent],
})
export class MinRPSGameComponent {
  public static readonly GAME_ROUND_DURATION = 13000;
  public static readonly SINGLE_MESSAGE_DURATION = 3000;
  public static readonly TOTAL_MESSAGE_DURATION = 10000;

  public readonly Color: typeof Color = Color;
  public readonly MinRPSMove: typeof MinRPSMove = MinRPSMove;

  public selectedPlayerMove: WritableSignal<MinRPSMove> = signal(MinRPSMove.None);
  public buttonText = computed(() => {
    switch (this.selectedPlayerMove()) {
      case MinRPSMove.None:
        return 'choose move';
      case MinRPSMove.Rock:
        return `play ${MinRPSMove.Rock}!`;
      case MinRPSMove.Paper:
        return `play ${MinRPSMove.Paper}!`;
      case MinRPSMove.Scissors:
        return `play ${MinRPSMove.Scissors}!`;
    }
  });
  public chatMessage = signal(MINRPS_START_MESSAGE);
  public lockedOpponentMove: WritableSignal<MinRPSMove> = signal(MinRPSMove.None);
  public lockedPlayerMove: WritableSignal<MinRPSMove> = signal(MinRPSMove.None);
  public gameResult: Signal<MinRPSGameResult> = computed(() => {
    const playerMove = this.lockedPlayerMove();
    const opponentMove = this.lockedOpponentMove();
    if (playerMove === MinRPSMove.None || opponentMove === MinRPSMove.None) {
      return MinRPSGameResult.None;
    }
    if (playerMove === opponentMove) {
      return MinRPSGameResult.Draw;
    }
    const playerWins: boolean =
      (playerMove === MinRPSMove.Rock && opponentMove === MinRPSMove.Scissors) ||
      (playerMove === MinRPSMove.Paper && opponentMove === MinRPSMove.Rock) ||
      (playerMove === MinRPSMove.Scissors && opponentMove === MinRPSMove.Paper);
    return playerWins ? MinRPSGameResult.Win : MinRPSGameResult.Loss;
  });
  public selectedOpponentMove: WritableSignal<MinRPSMove> = signal(MinRPSMove.None);

  public lockMove(): void {
    this.lockedPlayerMove.set(this.selectedPlayerMove());

    const moves: MinRPSMove[] = [MinRPSMove.Rock, MinRPSMove.Paper, MinRPSMove.Scissors];
    const opponentMove = moves[Math.floor(Math.random() * moves.length)];
    this.selectedOpponentMove.set(opponentMove);

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
        () => this.typeMessage(message),
        index * MinRPSGameComponent.SINGLE_MESSAGE_DURATION,
      );
    });

    setTimeout(() => {
      this.lockedOpponentMove.set(opponentMove);
    }, MinRPSGameComponent.TOTAL_MESSAGE_DURATION);

    setTimeout(() => {
      this.lockedPlayerMove.set(MinRPSMove.None);
      this.selectedPlayerMove.set(MinRPSMove.None);
      this.lockedOpponentMove.set(MinRPSMove.None);
      this.selectedOpponentMove.set(MinRPSMove.None);
      this.chatMessage.set(MINRPS_NEXT_MESSAGE);
    }, MinRPSGameComponent.GAME_ROUND_DURATION);
  }

  private typeMessage(message: string): void {
    this.chatMessage.set('&nbsp;');
    let index: number = 0;
    const interval: number = setInterval(() => {
      this.chatMessage.update((text: string) => text + message[index]);
      index++;
      if (index >= message.length) {
        clearInterval(interval);
      }
    }, 30);
  }
}
