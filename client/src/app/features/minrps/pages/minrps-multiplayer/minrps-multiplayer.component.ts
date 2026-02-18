import {
  Component,
  OnDestroy,
  OnInit,
  Signal,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MinRpsMove, MinRpsResult } from '../../../../core/generated';
import { RoutingService } from '../../../../core/services/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { DividerComponent } from '../../../../shared/components/divider/divider.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRpsCardComponent } from '../../components/minrps-card/minrps-card.component';
import { MinRpsMoveComponent } from '../../components/minrps-move/minrps-move.component';
import { MinRpsGameEvent } from '../../models/enums/minrps-game-event.enum';
import { MinRpsConnectedPayload } from '../../models/payloads/minrps-connected.payload';
import { MinRpsDisconnectedPayload } from '../../models/payloads/minrps-disconnected.payload';
import { MinRpsGameStateUpdatePayload } from '../../models/payloads/minrps-game-state-update.payload';
import { MinRpsJoinPayload } from '../../models/payloads/minrps-join.payload';
import { MinRpsJoinedPayload } from '../../models/payloads/minrps-joined.payload';
import { MinRpsLeavePayload } from '../../models/payloads/minrps-leave.payload';
import { MinRpsLeftPayload } from '../../models/payloads/minrps-left.payload';
import { MinRpsMoveSelectedPayload } from '../../models/payloads/minrps-move-selected.payload';
import { MinRpsPlayPayload } from '../../models/payloads/minrps-play.payload';
import { MinRpsPlayedPayload } from '../../models/payloads/minrps-played.payload';
import { MinRpsSelectMovePayload } from '../../models/payloads/minrps-select-move.payload';
import { MinRpsTakeSeatPayload } from '../../models/payloads/minrps-take-seat.payload';
import { MinRpsMultiplayerViewModel } from '../../models/viewmodels/minrps-multiplayer.viewmodel';
import { MinRpsGameService } from '../../services/minrps-game.service';
import { MinRpsMultiplayerService } from '../../services/minrps-multiplayer.service';

@Component({
  selector: 'minrps-multiplayer',
  templateUrl: './minrps-multiplayer.component.html',
  styleUrls: ['./minrps-multiplayer.component.scss'],
  host: { class: 'block h-full' },
  imports: [
    ButtonComponent,
    DividerComponent,
    MinRpsMoveComponent,
    MinRpsCardComponent,
    DialogComponent,
    InputComponent,
    ReactiveFormsModule,
  ],
})
export class MinRpsMultiplayerComponent implements OnInit, OnDestroy {
  public readonly Color: typeof Color = Color;
  public readonly MinRpsMove: typeof MinRpsMove = MinRpsMove;

  private readonly ROUND_CLEAR_DELAY = 2000;

  public game: WritableSignal<MinRpsMultiplayerViewModel> = signal(
    new MinRpsMultiplayerViewModel(),
  );
  public isSpectator: Signal<boolean> = computed(() => {
    const currentGame = this.game();
    return (
      !!currentGame.playerId &&
      currentGame.playerId !== currentGame.player1Id &&
      currentGame.playerId !== currentGame.player2Id
    );
  });
  public canTakePlayer1Seat: Signal<boolean> = computed(() => {
    const currentGame = this.game();
    return this.isSpectator() && !currentGame.player1Id;
  });
  public canTakePlayer2Seat: Signal<boolean> = computed(() => {
    const currentGame = this.game();
    return this.isSpectator() && !currentGame.player2Id;
  });
  public isPlayer: Signal<boolean> = computed(() => !this.isSpectator());
  public isSeatDialogOpen: WritableSignal<boolean> = signal(false);
  public opponentName: Signal<string> = computed(() => {
    const currentGame = this.game();
    if (currentGame.isPlayer1) {
      return currentGame.player2Name || 'Seat open';
    }
    if (currentGame.isPlayer2) {
      return currentGame.player1Name || 'Seat open';
    }
    return '';
  });
  public player1Label: Signal<string> = computed(() => {
    const currentGame = this.game();
    if (currentGame.player1Name) {
      return currentGame.player1Name;
    }
    return currentGame.player1Id ? 'Player 1' : 'Seat open';
  });
  public player2Label: Signal<string> = computed(() => {
    const currentGame = this.game();
    if (currentGame.player2Name) {
      return currentGame.player2Name;
    }
    return currentGame.player2Id ? 'Player 2' : 'Seat open';
  });
  public playerName: Signal<string> = computed(() => {
    const currentGame = this.game();
    if (currentGame.isPlayer1) {
      return currentGame.player1Name || 'Player 1';
    }
    if (currentGame.isPlayer2) {
      return currentGame.player2Name || 'Player 2';
    }
    return '';
  });
  public seatFormGroup: FormGroup = this.createSeatFormGroup();
  public selectableMoves: MinRpsMove[] = [MinRpsMove.Rock, MinRpsMove.Paper, MinRpsMove.Scissors];
  public selectedSeat: WritableSignal<number | null> = signal(null);
  public submitText: Signal<string> = computed(() => {
    const currentGame = this.game();
    if (currentGame.playerHasSelectedMove && !currentGame.opponentHasSelectedMove) {
      return 'waiting for opponent...';
    }
    switch (currentGame.playerSelectedMove) {
      case MinRpsMove.None:
        return 'choose move';
      case MinRpsMove.Rock:
        return 'play rock!';
      case MinRpsMove.Paper:
        return 'play paper!';
      case MinRpsMove.Scissors:
        return 'play scissors!';
      default:
        return '';
    }
  });

  private roundClearTimeoutId: number | null = null;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly gameService: MinRpsGameService,
    private readonly multiplayerService: MinRpsMultiplayerService,
    private readonly routingService: RoutingService,
  ) {}

  public get seatName(): FormControl {
    return this.seatFormGroup.get('name') as FormControl;
  }

  public ngOnInit() {
    this.setGameId();
    this.checkGameExists(this.game().gameId);
    this.multiplayerService.connect();
    this.subscribeToEvents();
  }

  public ngOnDestroy(): void {
    this.clearRoundTimer();
    this.sendLeaveEvent();
    this.unsubscribeFromEvents();
    this.multiplayerService.disconnect();
  }

  public closeSeatDialog(): void {
    this.isSeatDialogOpen.set(false);
  }

  public openSeatDialog(seat: number): void {
    if (seat === 1 && !this.canTakePlayer1Seat()) {
      return;
    }
    if (seat === 2 && !this.canTakePlayer2Seat()) {
      return;
    }
    this.seatFormGroup = this.createSeatFormGroup();
    this.selectedSeat.set(seat);
    this.isSeatDialogOpen.set(true);
  }

  public playGame(): void {
    if (!this.isPlayer()) {
      return;
    }
    const payload: MinRpsPlayPayload = new MinRpsPlayPayload();
    payload.gameId = this.game().gameId;
    payload.playerId = this.game().playerId;
    this.multiplayerService.sendPlayEvent(payload);
  }

  public selectMove(move: MinRpsMove): void {
    if (!this.isPlayer()) {
      return;
    }
    this.game.update((g) => {
      g.playerSelectedMove = move;
      return { ...g };
    });

    const payload: MinRpsSelectMovePayload = new MinRpsSelectMovePayload();
    payload.gameId = this.game().gameId;
    payload.playerId = this.game().playerId;
    payload.move = move;
    this.multiplayerService.sendSelectMoveEvent(payload);
  }

  public takeSeat(): void {
    if (this.seatFormGroup.invalid || this.selectedSeat() === null) {
      return;
    }
    const name = String(this.seatName.value || '')
      .trim()
      .slice(0, 16);
    if (!name) {
      return;
    }

    const payload: MinRpsTakeSeatPayload = new MinRpsTakeSeatPayload();
    payload.gameId = this.game().gameId;
    payload.playerId = this.game().playerId;
    payload.seat = this.selectedSeat() as number;
    payload.playerName = name;
    this.multiplayerService.sendTakeSeatEvent(payload);
    this.isSeatDialogOpen.set(false);
  }

  private async checkGameExists(id: string): Promise<void> {
    const gameExists: boolean = await this.gameService.gameExistByID(id);
    if (!gameExists) {
      this.routingService.navigateToMinRpsOverview();
    }
  }

  private clearRoundTimer(): void {
    if (this.roundClearTimeoutId !== null) {
      window.clearTimeout(this.roundClearTimeoutId);
      this.roundClearTimeoutId = null;
    }
  }

  private createSeatFormGroup(): FormGroup {
    return new FormGroup({
      name: new FormControl('', [Validators.maxLength(16), Validators.required]),
    });
  }

  private sendJoinEvent(): void {
    const payload: MinRpsJoinPayload = new MinRpsJoinPayload();
    payload.gameId = this.game().gameId;
    payload.playerId = this.game().playerId;
    this.multiplayerService.sendJoinEvent(payload);
  }

  private readonly onConnectedEvent = (payload: MinRpsConnectedPayload): void => {
    console.log(`${MinRpsGameEvent.Connected} event received`, payload);
    this.game.update((g) => {
      g.playerId = payload.playerId;
      return { ...g };
    });
    this.sendJoinEvent();
  };

  private readonly onDisconnectedEvent = (payload: MinRpsDisconnectedPayload): void => {
    console.log(`${MinRpsGameEvent.Disconnected} event received`, payload);
    this.game.update((g) => {
      if (g.opponentId && g.opponentId === payload.playerId) {
        g.opponentId = '';
        g.opponentHasSelectedMove = false;
        g.opponentMove = MinRpsMove.None;
      }
      return { ...g };
    });
  };

  private readonly onGameStateUpdateEvent = (payload: MinRpsGameStateUpdatePayload): void => {
    console.log(`${MinRpsGameEvent.GameStateUpdate} event received`, payload);
    this.game.update((g) => {
      const isPlayer1 = g.playerId === payload.player1Id;
      const isPlayer2 = g.playerId === payload.player2Id;
      g.isPlayer1 = isPlayer1;
      g.isPlayer2 = isPlayer2;
      g.player1Id = payload.player1Id;
      g.player2Id = payload.player2Id;
      g.player1Name = payload.player1Name;
      g.player2Name = payload.player2Name;
      g.player1HasSelectedMove = payload.player1HasSelectedMove;
      g.player2HasSelectedMove = payload.player2HasSelectedMove;
      if (isPlayer1) {
        g.opponentId = payload.player2Id;
        g.opponentHasSelectedMove = payload.player2HasSelectedMove;
        g.playerHasSelectedMove = payload.player1HasSelectedMove;
      } else if (isPlayer2) {
        g.opponentId = payload.player1Id;
        g.opponentHasSelectedMove = payload.player1HasSelectedMove;
        g.playerHasSelectedMove = payload.player2HasSelectedMove;
      } else {
        g.opponentId = '';
        g.opponentHasSelectedMove = false;
        g.playerHasSelectedMove = false;
      }
      if (!g.playerHasSelectedMove) {
        g.playerSelectedMove = MinRpsMove.None;
      }
      if (!g.opponentId) {
        g.opponentMove = MinRpsMove.None;
      }
      return { ...g };
    });
  };

  private readonly onJoinedEvent = (payload: MinRpsJoinedPayload): void => {
    console.log(`${MinRpsGameEvent.Joined} event received`, payload);
  };

  private readonly onLeftEvent = (payload: MinRpsLeftPayload): void => {
    console.log(`${MinRpsGameEvent.Left} event received`, payload);
    this.game.update((g) => {
      if (g.opponentId && g.opponentId === payload.playerId) {
        g.opponentId = '';
        g.opponentHasSelectedMove = false;
        g.opponentMove = MinRpsMove.None;
      }
      return { ...g };
    });
  };

  private readonly onMoveSelectedEvent = (payload: MinRpsMoveSelectedPayload): void => {
    console.log(`${MinRpsGameEvent.MoveSelected} event received`, payload);
    this.game.update((g) => {
      g.playerHasSelectedMove = true;
      return { ...g };
    });
  };

  private scheduleRoundClear(): void {
    this.clearRoundTimer();
    this.roundClearTimeoutId = window.setTimeout(() => {
      this.game.update((g) => {
        g.playerMove = MinRpsMove.None;
        g.opponentMove = MinRpsMove.None;
        g.player1Move = MinRpsMove.None;
        g.player2Move = MinRpsMove.None;
        g.result = MinRpsResult.None;
        g.player1Result = MinRpsResult.None;
        g.player2Result = MinRpsResult.None;
        return { ...g };
      });
    }, this.ROUND_CLEAR_DELAY);
  }

  private readonly onPlayedEvent = (payload: MinRpsPlayedPayload): void => {
    console.log(`${MinRpsGameEvent.Played} event received`, payload);
    this.game.update((g) => {
      const isPlayer1 = g.playerId === payload.player1Id;
      const isPlayer2 = g.playerId === payload.player2Id;
      g.player1Move = payload.player1Move;
      g.player2Move = payload.player2Move;
      g.player1Result = payload.player1Result;
      g.player2Result = payload.player2Result;
      if (isPlayer1) {
        g.playerMove = payload.player1Move;
        g.opponentMove = payload.player2Move;
      } else if (isPlayer2) {
        g.playerMove = payload.player2Move;
        g.opponentMove = payload.player1Move;
      } else {
        g.playerMove = MinRpsMove.None;
        g.opponentMove = MinRpsMove.None;
      }
      if (isPlayer1) {
        g.result = payload.player1Result;
      } else if (isPlayer2) {
        g.result = payload.player2Result;
      } else {
        g.result = MinRpsResult.None;
      }
      g.playerSelectedMove = MinRpsMove.None;
      g.playerHasSelectedMove = false;
      g.opponentHasSelectedMove = false;
      return { ...g };
    });
    this.scheduleRoundClear();
  };

  private sendLeaveEvent(): void {
    const payload: MinRpsLeavePayload = new MinRpsLeavePayload();
    payload.gameId = this.game().gameId;
    payload.playerId = this.game().playerId;
    this.multiplayerService.sendLeaveEvent(payload);
  }

  private setGameId(): void {
    const gameId: string = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.game.update((g) => {
      g.gameId = gameId;
      return { ...g };
    });
  }

  private subscribeToEvents(): void {
    this.multiplayerService.onEvent(MinRpsGameEvent.Connected, this.onConnectedEvent);
    this.multiplayerService.onEvent(MinRpsGameEvent.Joined, this.onJoinedEvent);
    this.multiplayerService.onEvent(MinRpsGameEvent.Left, this.onLeftEvent);
    this.multiplayerService.onEvent(MinRpsGameEvent.Disconnected, this.onDisconnectedEvent);
    this.multiplayerService.onEvent(MinRpsGameEvent.MoveSelected, this.onMoveSelectedEvent);
    this.multiplayerService.onEvent(MinRpsGameEvent.Played, this.onPlayedEvent);
    this.multiplayerService.onEvent(MinRpsGameEvent.GameStateUpdate, this.onGameStateUpdateEvent);
  }

  private unsubscribeFromEvents(): void {
    this.multiplayerService.offEvent(MinRpsGameEvent.Connected, this.onConnectedEvent);
    this.multiplayerService.offEvent(MinRpsGameEvent.Joined, this.onJoinedEvent);
    this.multiplayerService.offEvent(MinRpsGameEvent.Left, this.onLeftEvent);
    this.multiplayerService.offEvent(MinRpsGameEvent.Disconnected, this.onDisconnectedEvent);
    this.multiplayerService.offEvent(MinRpsGameEvent.MoveSelected, this.onMoveSelectedEvent);
    this.multiplayerService.offEvent(MinRpsGameEvent.Played, this.onPlayedEvent);
    this.multiplayerService.offEvent(MinRpsGameEvent.GameStateUpdate, this.onGameStateUpdateEvent);
  }
}
