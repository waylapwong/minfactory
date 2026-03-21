import { DecimalPipe } from '@angular/common';
import { Component, Signal, WritableSignal, computed, signal } from '@angular/core';
import { RoutingService } from '../../../../core/routing/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DividerComponent } from '../../../../shared/components/divider/divider.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { Color } from '../../../../shared/enums/color.enum';

interface Opponent {
  role: string;
  name: string;
  chips: number;
  lastAction: string;
  isActive?: boolean;
}

const MIN_BET = 40;

@Component({
  selector: 'minpoker-game',
  templateUrl: './minpoker-game.component.html',
  styleUrls: ['./minpoker-game.component.scss'],
  imports: [ButtonComponent, DecimalPipe, DividerComponent, H1Component, LogoComponent],
})
export class MinPokerGameComponent {
  public readonly Color: typeof Color = Color;

  public readonly opponents: Opponent[] = [
    { role: 'D', name: 'Alex', chips: 1240, lastAction: 'Call' },
    { role: 'SB', name: 'Mia', chips: 980, lastAction: '' },
    { role: 'BB', name: 'Noah', chips: 1120, lastAction: '', isActive: true },
    { role: '', name: 'Emma', chips: 1560, lastAction: '' },
    { role: '', name: 'Leo', chips: 1030, lastAction: '' },
  ];

  public readonly communityCards: readonly string[] = ['?', '?', '?', '?', '?'];
  public readonly handCards: readonly string[] = ['?', '?'];

  private readonly cachedBetAmount: WritableSignal<number> = signal(120);
  private readonly cachedPotAmount: WritableSignal<number> = signal(240);
  private readonly cachedCallAmount: WritableSignal<number> = signal(40);

  public betAmount: Signal<number> = computed(() => this.cachedBetAmount());
  public potAmount: Signal<number> = computed(() => this.cachedPotAmount());
  public callAmount: Signal<number> = computed(() => this.cachedCallAmount());

  constructor(public readonly routingService: RoutingService) {}

  public onBetChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.cachedBetAmount.set(Number(input.value));
  }

  public onFold(): void {
    this.routingService.navigateToMinPoker();
  }

  public onCall(): void {}

  public onRaise(): void {}

  public onSetBet(amount: 'min' | 'half-pot' | 'pot' | 'all-in'): void {
    switch (amount) {
      case 'min':
        this.cachedBetAmount.set(MIN_BET);
        break;
      case 'half-pot':
        this.cachedBetAmount.set(Math.floor(this.potAmount() / 2));
        break;
      case 'pot':
        this.cachedBetAmount.set(this.potAmount());
        break;
      case 'all-in':
        this.cachedBetAmount.set(this.opponents.reduce((max, o) => Math.max(max, o.chips), 0));
        break;
    }
  }
}
