import { DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, Signal, WritableSignal, computed, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RoutingService } from '../../../../core/routing/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { PlayingCardComponent } from '../../../../shared/components/playing-card/playing-card.component';
import { SelectComponent, SelectOption } from '../../../../shared/components/select/select.component';
import { SliderComponent } from '../../../../shared/components/slider/slider.component';
import { Color } from '../../../../shared/enums/color.enum';
import { CanLeaveGame } from '../../../../shared/guards/leave-game.guard';
import { MinPokerGameSeatViewModel } from '../../models/viewmodels/minpoker-game.viewmodel';
import { MinPokerMultiplayerService } from '../../services/minpoker-multiplayer.service';

@Component({
  selector: 'minpoker-game',
  templateUrl: './minpoker-game.component.html',
  styleUrls: ['./minpoker-game.component.scss'],
  host: { class: 'block h-full w-full' },
  imports: [
    ButtonComponent,
    DecimalPipe,
    DialogComponent,
    H2Component,
    InputComponent,
    PlayingCardComponent,
    ReactiveFormsModule,
    SelectComponent,
    SliderComponent,
  ],
})
export class MinPokerGameComponent implements OnInit, OnDestroy, CanLeaveGame {
  public readonly Color: typeof Color = Color;
  public readonly avatarOptions: readonly SelectOption[] = AVATAR_FILE_NAMES.map((avatarFileName) => ({
    imageSrc: this.getAvatarPath(avatarFileName),
    label: this.getAvatarLabel(avatarFileName),
    value: avatarFileName,
  }));
  public readonly communityCards: readonly string[] = ['?', '?', '?', '?', '?'];
  public readonly hand: Signal<string[]> = computed(() => this.multiplayerService.game().hand);
  public readonly isObserver: Signal<boolean> = computed(() => this.multiplayerService.game().isObserver);
  public readonly opponents: Signal<(MinPokerGameSeatViewModel | null)[]> = computed(
    () => this.multiplayerService.game().seats,
  );
  public readonly heroSeat: Signal<MinPokerGameSeatViewModel | null> = computed(() => {
    const heroId: string = this.multiplayerService.playerId();
    if (!heroId) {
      return null;
    }
    return this.opponents().find((seat) => seat?.id === heroId) ?? null;
  });
  public readonly topSeats: Signal<MinPokerDisplaySeatViewModel[]> = computed(() => {
    if (this.isObserver()) {
      return this.mapSeatsByOrder([0, 1, 2]);
    }

    const heroSeat: MinPokerGameSeatViewModel | null = this.heroSeat();
    const seatCount: number = this.getSeatCount();
    if (!heroSeat || seatCount <= 1) {
      return this.mapSeatsByOrder([0, 1, 2, 3, 4]);
    }

    const topSeatOrder: number[] = [];
    for (let offset = 1; offset < seatCount; offset++) {
      topSeatOrder.push((heroSeat.seat + offset) % seatCount);
    }

    return this.mapSeatsByOrder(topSeatOrder);
  });
  public readonly bottomObserverSeats: Signal<MinPokerDisplaySeatViewModel[]> = computed(() =>
    this.mapSeatsByOrder([5, 4, 3]),
  );

  private readonly cachedBetAmount: WritableSignal<number> = signal(2);
  private readonly cachedCallAmount: WritableSignal<number> = signal(120);
  private readonly cachedPotAmount: WritableSignal<number> = signal(240);

  public betAmount: Signal<number> = computed(() => this.cachedBetAmount());
  public callAmount: Signal<number> = computed(() => this.cachedCallAmount());
  public heroBetAmount: Signal<number> = computed(() => this.cachedBetAmount());
  public isLeaveDialogOpen: WritableSignal<boolean> = signal(false);
  public isSeatDialogOpen: WritableSignal<boolean> = signal(false);
  public potAmount: Signal<number> = computed(() => this.cachedPotAmount());
  public seatFormGroup: FormGroup = new FormGroup({});
  public selectedSeatIndex: WritableSignal<number> = signal(-1);

  private leaveConfirmationResolver: ((value: boolean) => void) | null = null;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly multiplayerService: MinPokerMultiplayerService,
    public readonly routingService: RoutingService,
  ) {
    this.seatFormGroup = this.createSeatFormGroup();
  }

  public get seatAvatar(): FormControl {
    return this.seatFormGroup.get('avatar') as FormControl<string>;
  }

  public get seatName(): FormControl {
    return this.seatFormGroup.get('name') as FormControl<string>;
  }

  public ngOnInit(): void {
    const id: string = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
    this.multiplayerService.setGameId(id);
    this.multiplayerService.connect();
  }

  public ngOnDestroy(): void {
    this.multiplayerService.leaveGame();
    this.multiplayerService.disconnect();
    this.leaveConfirmationResolver?.(false);
    this.leaveConfirmationResolver = null;
  }

  public canDeactivate(): Promise<boolean> {
    this.leaveConfirmationResolver?.(false);
    this.closeSeatDialog();
    this.isLeaveDialogOpen.set(true);
    return new Promise<boolean>((resolve) => {
      this.leaveConfirmationResolver = resolve;
    });
  }

  public cancelLeave(): void {
    this.isLeaveDialogOpen.set(false);
    this.leaveConfirmationResolver?.(false);
    this.leaveConfirmationResolver = null;
  }

  public closeSeatDialog(): void {
    this.isSeatDialogOpen.set(false);
    this.selectedSeatIndex.set(-1);
  }

  public confirmLeave(): void {
    this.isLeaveDialogOpen.set(false);
    this.leaveConfirmationResolver?.(true);
    this.leaveConfirmationResolver = null;
  }

  public getAvatarPath(avatarFileName: string): string {
    return `assets/svgs/minpoker/avatars/${avatarFileName}`;
  }

  public onBetChange(value: number): void {
    this.cachedBetAmount.set(value);
  }

  public onCall(): void {}

  public onFold(): void {}

  public onRaise(): void {}

  public openSeatDialog(seatIndex: number): void {
    if (!this.isObserver()) {
      return;
    }

    if (seatIndex < 0 || seatIndex >= this.getSeatCount() || this.opponents()[seatIndex]) {
      return;
    }
    this.seatFormGroup = this.createSeatFormGroup();
    this.selectedSeatIndex.set(seatIndex);
    this.isSeatDialogOpen.set(true);
  }

  public seatGame(): void {
    if (this.seatFormGroup.invalid || this.selectedSeatIndex() === -1) {
      return;
    }
    const playerName: string = this.seatName.value.trim();
    if (!playerName) {
      return;
    }
    this.multiplayerService.seatGame(playerName, this.seatAvatar.value, this.selectedSeatIndex());
    this.closeSeatDialog();
  }

  public shareGameUrl(): void {
    void navigator.clipboard.writeText(globalThis.location.href);
  }

  private createSeatFormGroup(): FormGroup {
    return this.formBuilder.group({
      avatar: ['', [Validators.required]],
      name: ['', [Validators.maxLength(16), Validators.required]],
    });
  }

  private getAvatarLabel(avatarFileName: string): string {
    return avatarFileName
      .replace('.svg', '')
      .split('-')
      .map((value) => value.charAt(0).toUpperCase() + value.slice(1))
      .join(' ');
  }

  private getSeatCount(): number {
    const game = this.multiplayerService.game();
    return Math.max(6, game.tableSize, game.seats.length);
  }

  private mapSeatsByOrder(order: readonly number[]): MinPokerDisplaySeatViewModel[] {
    return order.map((seatIndex: number) => ({
      player: this.opponents()[seatIndex] ?? null,
      seatIndex,
    }));
  }
}

interface MinPokerDisplaySeatViewModel {
  player: MinPokerGameSeatViewModel | null;
  seatIndex: number;
}

const AVATAR_FILE_NAMES: readonly string[] = [
  'man-1.svg',
  'man-2.svg',
  'man-3.svg',
  'man-4.svg',
  'woman-1.svg',
  'woman-2.svg',
  'woman-3.svg',
  'woman-4.svg',
  'woman-5.svg',
];
