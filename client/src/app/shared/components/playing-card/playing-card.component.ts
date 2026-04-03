import { Component, InputSignal, Signal, computed, input } from '@angular/core';

const SUIT_SYMBOLS: Readonly<Record<string, string>> = {
  c: '♣',
  d: '♦',
  h: '♥',
  s: '♠',
};

@Component({
  selector: 'min-playing-card',
  templateUrl: './playing-card.component.html',
  styleUrls: ['./playing-card.component.scss'],
  imports: [],
})
export class PlayingCardComponent {
  public card: InputSignal<string> = input.required<string>();

  public readonly isFaceDown: Signal<boolean> = computed(() => this.card() === '?');
  public readonly isRed: Signal<boolean> = computed(() => {
    const suit = this.card().slice(-1);
    return suit === 'h' || suit === 'd';
  });
  public readonly rank: Signal<string> = computed(() => {
    if (this.isFaceDown()) {
      return '';
    }
    return this.card().slice(0, -1);
  });
  public readonly suit: Signal<string> = computed(() => {
    if (this.isFaceDown()) {
      return '';
    }
    return SUIT_SYMBOLS[this.card().slice(-1)] ?? '';
  });
}
