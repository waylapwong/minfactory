import { Component, WritableSignal, computed, signal } from '@angular/core';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DividerComponent } from '../../../../shared/components/divider/divider.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRPSCardComponent } from '../../components/minrps-card/minrps-card.component';
import { MinRPSMoveComponent } from '../../components/minrps-move/minrps-move.component';
import { MinRPSMove } from '../../enums/minrps-move.enum';
import {
  MINRPS_FIRST_MESSAGES,
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
  public readonly Color: typeof Color = Color;
  public readonly MinRPSMove: typeof MinRPSMove = MinRPSMove;

  public selectedMove: WritableSignal<MinRPSMove> = signal(MinRPSMove.None);
  public buttonText = computed(() => {
    switch (this.selectedMove()) {
      case MinRPSMove.None:
        return 'choose move ...';
      case MinRPSMove.Rock:
        return `play ${MinRPSMove.Rock}!`;
      case MinRPSMove.Paper:
        return `play ${MinRPSMove.Paper}!`;
      case MinRPSMove.Scissors:
        return `play ${MinRPSMove.Scissors}!`;
    }
  });
  public chatMessage = signal(MINRPS_START_MESSAGE);
  public lockedMove: WritableSignal<MinRPSMove> = signal(MinRPSMove.None);

  public lockMove(): void {
    this.lockedMove.set(this.selectedMove());

    const moves: MinRPSMove[] = [MinRPSMove.Rock, MinRPSMove.Paper, MinRPSMove.Scissors];
    const finalMove = moves[Math.floor(Math.random() * moves.length)];

    let finalMessage = '';
    switch (finalMove) {
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
      setTimeout(() => this.typeMessage(message), index * 4000);
    });
  }

  private typeMessage(message: string): void {
    this.chatMessage.set('');
    let index: number = 0;
    const interval: number = setInterval(() => {
      this.chatMessage.update((text: string) => text + message[index]);
      index++;
      if (index >= message.length) {
        clearInterval(interval);
      }
    }, 50);
  }
}
