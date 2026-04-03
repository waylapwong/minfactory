import { Component, InputSignal, Signal, computed, input } from '@angular/core';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'min-playing-card',
  templateUrl: './playing-card.component.html',
  styleUrls: ['./playing-card.component.scss'],
  imports: [LogoComponent],
})
export class PlayingCardComponent {
  public readonly isFaceDown: Signal<boolean> = computed(() => this.card() === '?');
  public readonly suit: Signal<string> = computed(() => {
    if (this.isFaceDown()) {
      return '';
    }
    return SUIT_SYMBOLS[this.card().slice(-1)] ?? '';
  });
  public readonly isBlack: Signal<boolean> = computed(() => {
    const suit = this.card().slice(-1);
    return suit === 's';
  });
  public readonly isBlue: Signal<boolean> = computed(() => {
    const suit = this.card().slice(-1);
    return suit === 'd';
  });
  public readonly isGreen: Signal<boolean> = computed(() => {
    const suit = this.card().slice(-1);
    return suit === 'c';
  });
  public readonly isRed: Signal<boolean> = computed(() => {
    const suit = this.card().slice(-1);
    return suit === 'h';
  });
  public readonly rank: Signal<string> = computed(() => {
    if (this.isFaceDown()) {
      return '';
    }
    return this.card().slice(0, -1);
  });

  public card: InputSignal<string> = input.required<string>();
}

const SUIT_SYMBOLS: Readonly<Record<string, string>> = {
  c: '♣',
  d: '♦',
  h: '♥',
  s: '♠',
};
