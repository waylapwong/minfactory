import { DecimalPipe } from '@angular/common';
import { Component, Signal, WritableSignal, computed, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoutingService } from '../../../../core/routing/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { DividerComponent } from '../../../../shared/components/divider/divider.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { Color } from '../../../../shared/enums/color.enum';

interface Opponent {
  betAmount?: number;
  chips: number;
  isActive?: boolean;
  lastAction?: string;
  name: string;
  role?: string;
}

@Component({
  selector: 'minpoker-game',
  templateUrl: './minpoker-game.component.html',
  styleUrls: ['./minpoker-game.component.scss'],
  host: { class: 'block h-full w-full' },
  imports: [
    ButtonComponent,
    DecimalPipe,
    DialogComponent,
    DividerComponent,
    H2Component,
    InputComponent,
    ReactiveFormsModule,
  ],
})
export class MinPokerGameComponent {
  public readonly Color: typeof Color = Color;
  public readonly communityCards: readonly string[] = ['?', '?', '?', '?', '?'];
  public readonly handCards: readonly string[] = ['?', '?'];
  public readonly opponents: (Opponent | null)[] = [
    { role: 'D', name: 'Alex', chips: 1240, lastAction: 'Call', betAmount: 40 },
    { name: 'Mia', chips: 980, lastAction: 'Raise', betAmount: 120 },
    { name: 'Noah', chips: 1120, isActive: true, lastAction: 'Denkt nach' },
    { name: 'Emma', chips: 1560, lastAction: 'Fold' },
    null,
    { name: 'Way-Lap', chips: 1030, lastAction: 'Call', betAmount: 120 },
  ];
  public isSeatDialogOpen: WritableSignal<boolean> = signal(false);
  public seatFormGroup: FormGroup = new FormGroup({});
  public selectedSeatIndex: WritableSignal<number> = signal(-1);

  private readonly cachedBetAmount: WritableSignal<number> = signal(120);
  private readonly cachedCallAmount: WritableSignal<number> = signal(40);
  private readonly cachedPotAmount: WritableSignal<number> = signal(240);

  public betAmount: Signal<number> = computed(() => this.cachedBetAmount());
  public callAmount: Signal<number> = computed(() => this.cachedCallAmount());
  public potAmount: Signal<number> = computed(() => this.cachedPotAmount());

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly routingService: RoutingService,
  ) {
    this.seatFormGroup = this.createSeatFormGroup();
  }

  public get seatName(): FormControl {
    return this.seatFormGroup.get('name') as FormControl<string>;
  }

  public closeSeatDialog(): void {
    this.isSeatDialogOpen.set(false);
    this.selectedSeatIndex.set(-1);
  }

  public openSeatDialog(seatIndex: number): void {
    if (seatIndex < 0 || seatIndex >= this.opponents.length || this.opponents[seatIndex]) {
      return;
    }
    this.seatFormGroup = this.createSeatFormGroup();
    this.selectedSeatIndex.set(seatIndex);
    this.isSeatDialogOpen.set(true);
  }

  public onBetChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.cachedBetAmount.set(Number(input.value));
  }

  public onCall(): void {}

  public onFold(): void {
    this.routingService.navigateToMinPoker();
  }

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
        this.cachedBetAmount.set(this.opponents.reduce((max, o) => Math.max(max, o?.chips ?? 0), 0));
        break;
    }
  }

  public seatGame(): void {
    if (this.seatFormGroup.invalid || this.selectedSeatIndex() === -1) {
      return;
    }
    const playerName: string = this.seatName.value.trim();
    if (!playerName) {
      return;
    }

    this.opponents[this.selectedSeatIndex()] = {
      chips: DEFAULT_SEAT_CHIPS,
      lastAction: 'Sitzt',
      name: playerName,
    };

    this.closeSeatDialog();
  }

  public shareGameUrl(): void {
    void navigator.clipboard.writeText(globalThis.location.href);
  }

  private createSeatFormGroup(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.maxLength(16), Validators.required]],
    });
  }
}

const DEFAULT_SEAT_CHIPS = 1000;
const MIN_BET = 40;
