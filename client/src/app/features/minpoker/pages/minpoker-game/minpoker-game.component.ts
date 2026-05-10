import { DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, Signal, WritableSignal, computed, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoggerService } from '../../../../core/logging/services/logger.service';
import { RoutingService } from '../../../../core/routing/services/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { PlayingCardComponent } from '../../../../shared/components/playing-card/playing-card.component';
import { SelectComponent, SelectOption } from '../../../../shared/components/select/select.component';
import { SliderComponent } from '../../../../shared/components/slider/slider.component';
import { Color } from '../../../../shared/enums/color.enum';
import { CanLeaveGame } from '../../../../shared/guards/leave-game.guard';
import { MinPokerGameSeatVm } from '../../models/viewmodels/minpoker-game.vm';
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
  private readonly logger: LoggerService = new LoggerService(MinPokerGameComponent.name);

  public readonly avatarOptions: readonly SelectOption[] = AVATAR_FILE_NAMES.map((avatarFileName) => ({
    imageSrc: this.getAvatarPath(avatarFileName),
    label: this.getAvatarLabel(avatarFileName),
    value: avatarFileName,
  }));
  public readonly communityCards: readonly string[] = ['?', '?', '?', '?', '?'];
  public readonly hand: Signal<string[]> = computed(() => this.multiplayerService.game().hand);
  public readonly isObserver: Signal<boolean> = computed(() => this.multiplayerService.game().isObserver);
  public readonly isRoundActive: Signal<boolean> = computed(() => this.hand().length > 0);
  public readonly opponents: Signal<(MinPokerGameSeatVm | null)[]> = computed(() => this.multiplayerService.game().seats);
  public readonly heroSeat: Signal<MinPokerGameSeatVm | null> = computed(() => {
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

    const heroSeat: MinPokerGameSeatVm | null = this.heroSeat();
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
  public readonly bottomObserverSeats: Signal<MinPokerDisplaySeatViewModel[]> = computed(() => this.mapSeatsByOrder([5, 4, 3]));

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
    this.logger.debug(`START seatAvatar()`);
    try {
      return this.seatFormGroup.get('avatar') as FormControl<string>;
    } finally {
      this.logger.debug(`END seatAvatar(...)`);
    }
  }

  public get seatName(): FormControl {
    this.logger.debug(`START seatName()`);
    try {
      return this.seatFormGroup.get('name') as FormControl<string>;
    } finally {
      this.logger.debug(`END seatName(...)`);
    }
  }

  public ngOnInit(): void {
    this.logger.debug(`START ngOnInit()`);
    const id: string = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
    this.multiplayerService.setGameId(id);
    this.multiplayerService.connect();
    this.logger.debug(`END ngOnInit(...)`);
  }

  public ngOnDestroy(): void {
    this.logger.debug(`START ngOnDestroy()`);
    this.multiplayerService.leaveGame();
    this.multiplayerService.disconnect();
    this.leaveConfirmationResolver?.(false);
    this.leaveConfirmationResolver = null;
    this.logger.debug(`END ngOnDestroy(...)`);
  }

  public canDeactivate(): Promise<boolean> {
    this.logger.debug(`START canDeactivate()`);
    this.leaveConfirmationResolver?.(false);
    this.closeSeatDialog();
    this.isLeaveDialogOpen.set(true);
    try {
      return new Promise<boolean>((resolve) => {
        this.leaveConfirmationResolver = resolve;
      });
    } finally {
      this.logger.debug(`END canDeactivate(...)`);
    }
  }

  public cancelLeave(): void {
    this.logger.debug(`START cancelLeave()`);
    this.isLeaveDialogOpen.set(false);
    this.leaveConfirmationResolver?.(false);
    this.leaveConfirmationResolver = null;
    this.logger.debug(`END cancelLeave(...)`);
  }

  public closeSeatDialog(): void {
    this.logger.debug(`START closeSeatDialog()`);
    this.isSeatDialogOpen.set(false);
    this.selectedSeatIndex.set(-1);
    this.logger.debug(`END closeSeatDialog(...)`);
  }

  public confirmLeave(): void {
    this.logger.debug(`START confirmLeave()`);
    this.isLeaveDialogOpen.set(false);
    this.leaveConfirmationResolver?.(true);
    this.leaveConfirmationResolver = null;
    this.logger.debug(`END confirmLeave(...)`);
  }

  public getAvatarPath(avatarFileName: string): string {
    this.logger.debug(`START getAvatarPath(avatarFileName: ${avatarFileName})`);
    try {
      return `assets/svgs/minpoker/avatars/${avatarFileName}`;
    } finally {
      this.logger.debug(`END getAvatarPath(...)`);
    }
  }

  public onBetChange(value: number): void {
    this.logger.debug(`START onBetChange(value: ${value})`);
    this.cachedBetAmount.set(value);
    this.logger.debug(`END onBetChange(...)`);
  }

  public onCall(): void {
    this.logger.debug(`START onCall()`);
    this.logger.debug(`END onCall(...)`);
  }

  public onFold(): void {
    this.logger.debug(`START onFold()`);
    this.logger.debug(`END onFold(...)`);
  }

  public onRaise(): void {
    this.logger.debug(`START onRaise()`);
    this.logger.debug(`END onRaise(...)`);
  }

  public openSeatDialog(seatIndex: number): void {
    this.logger.debug(`START openSeatDialog(seatIndex: ${seatIndex})`);
    if (!this.isObserver()) {
      this.logger.debug(`END openSeatDialog(...)`);
      return;
    }

    if (seatIndex < 0 || seatIndex >= this.getSeatCount() || this.opponents()[seatIndex]) {
      this.logger.debug(`END openSeatDialog(...)`);
      return;
    }
    this.seatFormGroup = this.createSeatFormGroup();
    this.selectedSeatIndex.set(seatIndex);
    this.isSeatDialogOpen.set(true);
    this.logger.debug(`END openSeatDialog(...)`);
  }

  public seatGame(): void {
    this.logger.debug(`START seatGame()`);
    if (this.seatFormGroup.invalid || this.selectedSeatIndex() === -1) {
      this.logger.debug(`END seatGame(...)`);
      return;
    }
    const playerName: string = this.seatName.value.trim();
    if (!playerName) {
      this.logger.debug(`END seatGame(...)`);
      return;
    }
    this.multiplayerService.seatGame(playerName, this.seatAvatar.value, this.selectedSeatIndex());
    this.closeSeatDialog();
    this.logger.debug(`END seatGame(...)`);
  }

  public shareGameUrl(): void {
    this.logger.debug(`START shareGameUrl()`);
    void navigator.clipboard.writeText(globalThis.location.href);
    this.logger.debug(`END shareGameUrl(...)`);
  }

  private createSeatFormGroup(): FormGroup {
    this.logger.debug(`START createSeatFormGroup()`);
    try {
      return this.formBuilder.group({
        avatar: ['', [Validators.required]],
        name: ['', [Validators.maxLength(16), Validators.required]],
      });
    } finally {
      this.logger.debug(`END createSeatFormGroup(...)`);
    }
  }

  private getAvatarLabel(avatarFileName: string): string {
    this.logger.debug(`START getAvatarLabel(avatarFileName: ${avatarFileName})`);
    try {
      return avatarFileName
        .replace('.svg', '')
        .split('-')
        .map((value) => value.charAt(0).toUpperCase() + value.slice(1))
        .join(' ');
    } finally {
      this.logger.debug(`END getAvatarLabel(...)`);
    }
  }

  private getSeatCount(): number {
    this.logger.debug(`START getSeatCount()`);
    try {
      const game = this.multiplayerService.game();
      return Math.max(6, game.tableSize, game.seats.length);
    } finally {
      this.logger.debug(`END getSeatCount(...)`);
    }
  }

  private mapSeatsByOrder(order: readonly number[]): MinPokerDisplaySeatViewModel[] {
    this.logger.debug(`START mapSeatsByOrder(order: ${order.join(',')})`);
    try {
      return order.map((seatIndex: number) => ({
        player: this.opponents()[seatIndex] ?? null,
        seatIndex,
      }));
    } finally {
      this.logger.debug(`END mapSeatsByOrder(...)`);
    }
  }
}

interface MinPokerDisplaySeatViewModel {
  player: MinPokerGameSeatVm | null;
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
