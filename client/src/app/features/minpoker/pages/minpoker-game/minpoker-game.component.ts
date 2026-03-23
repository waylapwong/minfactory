import { DecimalPipe } from '@angular/common';
import { Component, OnDestroy, Signal, WritableSignal, computed, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoutingService } from '../../../../core/routing/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { SelectComponent, SelectOption } from '../../../../shared/components/select/select.component';
import { SliderComponent } from '../../../../shared/components/slider/slider.component';
import { Color } from '../../../../shared/enums/color.enum';
import { CanLeaveGame } from '../../guards/leave-game.guard';

interface Opponent {
  avatar: string;
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
    H2Component,
    InputComponent,
    ReactiveFormsModule,
    SelectComponent,
    SliderComponent,
    LogoComponent,
  ],
})
export class MinPokerGameComponent implements OnDestroy, CanLeaveGame {
  public readonly Color: typeof Color = Color;
  public readonly avatarOptions: readonly SelectOption[] = AVATAR_FILE_NAMES.map((avatarFileName) => ({
    imageSrc: this.getAvatarPath(avatarFileName),
    label: this.getAvatarLabel(avatarFileName),
    value: avatarFileName,
  }));
  public readonly communityCards: readonly string[] = ['?', '?', '?', '?', '?'];
  public readonly handCards: readonly string[] = ['?', '?'];
  public readonly opponents: (Opponent | null)[] = [
    { avatar: 'woman-1.svg', role: 'D', name: 'Alex', chips: 160, lastAction: 'Call', betAmount: 40 },
    { avatar: 'man-2.svg', name: 'Mia', chips: 80, lastAction: 'Raise', betAmount: 120 },
    { avatar: 'man-3.svg', name: 'Noah', chips: 200, isActive: true, lastAction: 'Denkt nach' },
    { avatar: 'woman-4.svg', name: 'Emma', chips: 200, lastAction: 'Fold' },
    null,
    { avatar: 'man-1.svg', name: 'Way-Lap', chips: 1030, lastAction: 'Call', betAmount: 120 },
  ];

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
    private readonly formBuilder: FormBuilder,
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

  public ngOnDestroy(): void {
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
    if (seatIndex < 0 || seatIndex >= this.opponents.length || this.opponents[seatIndex]) {
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

    this.opponents[this.selectedSeatIndex()] = {
      avatar: this.seatAvatar.value,
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
const DEFAULT_SEAT_CHIPS = 1000;
