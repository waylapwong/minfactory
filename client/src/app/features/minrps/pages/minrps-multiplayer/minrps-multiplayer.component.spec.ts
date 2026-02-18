import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { MinRpsMove, MinRpsResult } from '../../../../core/generated';
import { RoutingService } from '../../../../core/services/routing.service';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRpsGameEvent } from '../../models/enums/minrps-game-event.enum';
import { MinRpsGameService } from '../../services/minrps-game.service';
import { MinRpsMultiplayerService } from '../../services/minrps-multiplayer.service';
import { MinRpsMultiplayerComponent } from './minrps-multiplayer.component';

describe('MinRpsMultiplayerComponent', () => {
  let component: MinRpsMultiplayerComponent;
  let fixture: ComponentFixture<MinRpsMultiplayerComponent>;
  let mockGameService: jasmine.SpyObj<MinRpsGameService>;
  let mockRoutingService: jasmine.SpyObj<RoutingService>;
  let mockMultiplayerService: jasmine.SpyObj<MinRpsMultiplayerService>;

  beforeEach(async () => {
    mockGameService = jasmine.createSpyObj('MinRpsGameService', ['gameExistByID'], {
      games: signal([]),
    });
    mockRoutingService = jasmine.createSpyObj('RoutingService', ['navigateToMinRpsOverview']);
    mockMultiplayerService = jasmine.createSpyObj('MinRpsMultiplayerService', [
      'connect',
      'disconnect',
      'onEvent',
      'offEvent',
      'sendJoinEvent',
      'sendLeaveEvent',
      'sendSelectMoveEvent',
      'sendPlayEvent',
      'sendTakeSeatEvent',
    ]);
    const mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({ id: 'test-id' }),
      },
      queryParams: of({ id: 'test-id' }),
    };

    mockGameService.gameExistByID.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [MinRpsMultiplayerComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinRpsGameService, useValue: mockGameService },
        { provide: RoutingService, useValue: mockRoutingService },
        { provide: MinRpsMultiplayerService, useValue: mockMultiplayerService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRpsMultiplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have Color enum available', () => {
    expect(component.Color).toBe(Color);
  });

  it('should have MinRpsMove enum available', () => {
    expect(component.MinRpsMove).toBe(MinRpsMove);
  });

  it('should have selectable moves array', () => {
    expect(component.selectableMoves).toEqual([MinRpsMove.Rock, MinRpsMove.Paper, MinRpsMove.Scissors]);
  });

  describe('ngOnInit()', () => {
    it('should set game id from route', () => {
      expect(component.game().gameId).toBe('test-id');
    });

    it('should connect to multiplayer service', () => {
      expect(mockMultiplayerService.connect).toHaveBeenCalled();
    });

    it('should subscribe to all events', () => {
      expect(mockMultiplayerService.onEvent).toHaveBeenCalledWith(MinRpsGameEvent.Connected, jasmine.any(Function));
      expect(mockMultiplayerService.onEvent).toHaveBeenCalledWith(MinRpsGameEvent.Joined, jasmine.any(Function));
      expect(mockMultiplayerService.onEvent).toHaveBeenCalledWith(MinRpsGameEvent.Left, jasmine.any(Function));
      expect(mockMultiplayerService.onEvent).toHaveBeenCalledWith(MinRpsGameEvent.Disconnected, jasmine.any(Function));
      expect(mockMultiplayerService.onEvent).toHaveBeenCalledWith(MinRpsGameEvent.MoveSelected, jasmine.any(Function));
      expect(mockMultiplayerService.onEvent).toHaveBeenCalledWith(MinRpsGameEvent.Played, jasmine.any(Function));
      expect(mockMultiplayerService.onEvent).toHaveBeenCalledWith(MinRpsGameEvent.GameStateUpdate, jasmine.any(Function));
    });

    it('should navigate away if game does not exist', async () => {
      mockGameService.gameExistByID.and.returnValue(Promise.resolve(false));
      await component['checkGameExists']('non-existent-id');
      expect(mockRoutingService.navigateToMinRpsOverview).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy()', () => {
    it('should unsubscribe from all events', () => {
      component.ngOnDestroy();
      expect(mockMultiplayerService.offEvent).toHaveBeenCalledWith(MinRpsGameEvent.Connected, jasmine.any(Function));
      expect(mockMultiplayerService.offEvent).toHaveBeenCalledWith(MinRpsGameEvent.Joined, jasmine.any(Function));
      expect(mockMultiplayerService.offEvent).toHaveBeenCalledWith(MinRpsGameEvent.Left, jasmine.any(Function));
      expect(mockMultiplayerService.offEvent).toHaveBeenCalledWith(MinRpsGameEvent.Disconnected, jasmine.any(Function));
      expect(mockMultiplayerService.offEvent).toHaveBeenCalledWith(MinRpsGameEvent.MoveSelected, jasmine.any(Function));
      expect(mockMultiplayerService.offEvent).toHaveBeenCalledWith(MinRpsGameEvent.Played, jasmine.any(Function));
      expect(mockMultiplayerService.offEvent).toHaveBeenCalledWith(MinRpsGameEvent.GameStateUpdate, jasmine.any(Function));
    });

    it('should send leave event', () => {
      component.ngOnDestroy();
      expect(mockMultiplayerService.sendLeaveEvent).toHaveBeenCalled();
    });

    it('should disconnect from multiplayer service', () => {
      component.ngOnDestroy();
      expect(mockMultiplayerService.disconnect).toHaveBeenCalled();
    });
  });

  describe('submitText computed signal', () => {
    it('should return "choose move" when no move selected', () => {
      component.game.update(g => ({ ...g, playerSelectedMove: MinRpsMove.None }));
      expect(component.submitText()).toBe('choose move');
    });

    it('should return "play rock!" when rock is selected', () => {
      component.game.update(g => ({ ...g, playerSelectedMove: MinRpsMove.Rock, playerHasSelectedMove: false }));
      expect(component.submitText()).toBe('play rock!');
    });

    it('should return "play paper!" when paper is selected', () => {
      component.game.update(g => ({ ...g, playerSelectedMove: MinRpsMove.Paper, playerHasSelectedMove: false }));
      expect(component.submitText()).toBe('play paper!');
    });

    it('should return "play scissors!" when scissors is selected', () => {
      component.game.update(g => ({ ...g, playerSelectedMove: MinRpsMove.Scissors, playerHasSelectedMove: false }));
      expect(component.submitText()).toBe('play scissors!');
    });

    it('should return "waiting for opponent..." when player has selected but opponent has not', () => {
      component.game.update(g => ({ 
        ...g, 
        playerSelectedMove: MinRpsMove.Rock,
        playerHasSelectedMove: true,
        opponentHasSelectedMove: false
      }));
      expect(component.submitText()).toBe('waiting for opponent...');
    });
  });

  describe('isSpectator computed signal', () => {
    it('should return false when no player id', () => {
      component.game.update(g => ({ ...g, playerId: '' }));
      expect(component.isSpectator()).toBe(false);
    });

    it('should return true when player is spectator', () => {
      component.game.update(g => ({ ...g, playerId: 'spectator-id', player1Id: 'p1', player2Id: 'p2' }));
      expect(component.isSpectator()).toBe(true);
    });

    it('should return false when player is player1', () => {
      component.game.update(g => ({ ...g, playerId: 'p1', player1Id: 'p1' }));
      expect(component.isSpectator()).toBe(false);
    });

    it('should return false when player is player2', () => {
      component.game.update(g => ({ ...g, playerId: 'p2', player2Id: 'p2' }));
      expect(component.isSpectator()).toBe(false);
    });
  });

  describe('isPlayer computed signal', () => {
    it('should be opposite of isSpectator', () => {
      component.game.update(g => ({ ...g, playerId: 'p1', player1Id: 'p1' }));
      expect(component.isPlayer()).toBe(true);
      
      component.game.update(g => ({ ...g, playerId: 'spectator', player1Id: 'p1', player2Id: 'p2' }));
      expect(component.isPlayer()).toBe(false);
    });
  });

  describe('playerName computed signal', () => {
    it('should return player1 name when is player1', () => {
      component.game.update(g => ({ ...g, playerId: 'p1', player1Id: 'p1', isPlayer1: true, player1Name: 'Alice' }));
      expect(component.playerName()).toBe('Alice');
    });

    it('should return "Player 1" when is player1 without name', () => {
      component.game.update(g => ({ ...g, playerId: 'p1', player1Id: 'p1', isPlayer1: true, player1Name: '' }));
      expect(component.playerName()).toBe('Player 1');
    });

    it('should return player2 name when is player2', () => {
      component.game.update(g => ({ ...g, playerId: 'p2', player2Id: 'p2', isPlayer2: true, player2Name: 'Bob' }));
      expect(component.playerName()).toBe('Bob');
    });

    it('should return empty string when spectator', () => {
      component.game.update(g => ({ ...g, playerId: 'spectator', player1Id: 'p1', player2Id: 'p2' }));
      expect(component.playerName()).toBe('');
    });
  });

  describe('opponentName computed signal', () => {
    it('should return player2 name when is player1', () => {
      component.game.update(g => ({ ...g, playerId: 'p1', player1Id: 'p1', isPlayer1: true, player2Name: 'Bob' }));
      expect(component.opponentName()).toBe('Bob');
    });

    it('should return "Seat open" when opponent seat is empty', () => {
      component.game.update(g => ({ ...g, playerId: 'p1', player1Id: 'p1', isPlayer1: true, player2Name: '' }));
      expect(component.opponentName()).toBe('Seat open');
    });
  });

  describe('player1Label computed signal', () => {
    it('should return player1 name if set', () => {
      component.game.update(g => ({ ...g, player1Name: 'Alice', player1Id: 'p1' }));
      expect(component.player1Label()).toBe('Alice');
    });

    it('should return "Player 1" if player1 id exists but no name', () => {
      component.game.update(g => ({ ...g, player1Name: '', player1Id: 'p1' }));
      expect(component.player1Label()).toBe('Player 1');
    });

    it('should return "Seat open" if no player1', () => {
      component.game.update(g => ({ ...g, player1Name: '', player1Id: '' }));
      expect(component.player1Label()).toBe('Seat open');
    });
  });

  describe('player2Label computed signal', () => {
    it('should return player2 name if set', () => {
      component.game.update(g => ({ ...g, player2Name: 'Bob', player2Id: 'p2' }));
      expect(component.player2Label()).toBe('Bob');
    });

    it('should return "Seat open" if no player2', () => {
      component.game.update(g => ({ ...g, player2Name: '', player2Id: '' }));
      expect(component.player2Label()).toBe('Seat open');
    });
  });

  describe('canTakePlayer1Seat computed signal', () => {
    it('should return true when spectator and seat is open', () => {
      component.game.update(g => ({ ...g, playerId: 'spectator', player1Id: '', player2Id: 'p2' }));
      expect(component.canTakePlayer1Seat()).toBe(true);
    });

    it('should return false when not spectator', () => {
      component.game.update(g => ({ ...g, playerId: 'p2', player1Id: '', player2Id: 'p2' }));
      expect(component.canTakePlayer1Seat()).toBe(false);
    });

    it('should return false when seat is taken', () => {
      component.game.update(g => ({ ...g, playerId: 'spectator', player1Id: 'p1', player2Id: 'p2' }));
      expect(component.canTakePlayer1Seat()).toBe(false);
    });
  });

  describe('canTakePlayer2Seat computed signal', () => {
    it('should return true when spectator and seat is open', () => {
      component.game.update(g => ({ ...g, playerId: 'spectator', player1Id: 'p1', player2Id: '' }));
      expect(component.canTakePlayer2Seat()).toBe(true);
    });

    it('should return false when seat is taken', () => {
      component.game.update(g => ({ ...g, playerId: 'spectator', player1Id: 'p1', player2Id: 'p2' }));
      expect(component.canTakePlayer2Seat()).toBe(false);
    });
  });

  describe('playGame()', () => {
    it('should send play event when is player', () => {
      component.game.update(g => ({ ...g, playerId: 'p1', player1Id: 'p1', gameId: 'game-id' }));
      component.playGame();
      expect(mockMultiplayerService.sendPlayEvent).toHaveBeenCalledWith(jasmine.objectContaining({
        gameId: 'game-id',
        playerId: 'p1'
      }));
    });

    it('should not send play event when is spectator', () => {
      component.game.update(g => ({ ...g, playerId: 'spectator', player1Id: 'p1', player2Id: 'p2' }));
      component.playGame();
      expect(mockMultiplayerService.sendPlayEvent).not.toHaveBeenCalled();
    });
  });

  describe('selectMove()', () => {
    it('should update game state and send event when is player', () => {
      component.game.update(g => ({ ...g, playerId: 'p1', player1Id: 'p1', gameId: 'game-id' }));
      component.selectMove(MinRpsMove.Rock);
      expect(component.game().playerSelectedMove).toBe(MinRpsMove.Rock);
      expect(mockMultiplayerService.sendSelectMoveEvent).toHaveBeenCalledWith(jasmine.objectContaining({
        gameId: 'game-id',
        playerId: 'p1',
        move: MinRpsMove.Rock
      }));
    });

    it('should not send event when is spectator', () => {
      component.game.update(g => ({ ...g, playerId: 'spectator', player1Id: 'p1', player2Id: 'p2' }));
      component.selectMove(MinRpsMove.Rock);
      expect(mockMultiplayerService.sendSelectMoveEvent).not.toHaveBeenCalled();
    });
  });

  describe('seatName getter', () => {
    it('should return the name form control', () => {
      const control = component.seatName;
      expect(control).toBeTruthy();
      expect(control.value).toBe('');
    });
  });

  describe('openSeatDialog()', () => {
    it('should open dialog for seat 1 when can take seat', () => {
      component.game.update(g => ({ ...g, playerId: 'spectator', player1Id: '', player2Id: 'p2' }));
      component.openSeatDialog(1);
      expect(component.selectedSeat()).toBe(1);
      expect(component.isSeatDialogOpen()).toBe(true);
    });

    it('should not open dialog for seat 1 when cannot take seat', () => {
      component.game.update(g => ({ ...g, playerId: 'spectator', player1Id: 'p1', player2Id: 'p2' }));
      component.isSeatDialogOpen.set(false);
      component.openSeatDialog(1);
      expect(component.isSeatDialogOpen()).toBe(false);
    });

    it('should open dialog for seat 2 when can take seat', () => {
      component.game.update(g => ({ ...g, playerId: 'spectator', player1Id: 'p1', player2Id: '' }));
      component.openSeatDialog(2);
      expect(component.selectedSeat()).toBe(2);
      expect(component.isSeatDialogOpen()).toBe(true);
    });

    it('should reset form when opening dialog', () => {
      component.game.update(g => ({ ...g, playerId: 'spectator', player1Id: '', player2Id: 'p2' }));
      component.seatFormGroup.patchValue({ name: 'Old Name' });
      component.openSeatDialog(1);
      expect(component.seatName.value).toBe('');
    });
  });

  describe('closeSeatDialog()', () => {
    it('should close the seat dialog', () => {
      component.isSeatDialogOpen.set(true);
      component.closeSeatDialog();
      expect(component.isSeatDialogOpen()).toBe(false);
    });
  });

  describe('takeSeat()', () => {
    it('should send take seat event when form is valid', () => {
      component.game.update(g => ({ ...g, playerId: 'spectator', gameId: 'game-id' }));
      component.selectedSeat.set(1);
      component.seatFormGroup.patchValue({ name: 'Alice' });
      
      component.takeSeat();
      
      expect(mockMultiplayerService.sendTakeSeatEvent).toHaveBeenCalledWith(jasmine.objectContaining({
        gameId: 'game-id',
        playerId: 'spectator',
        seat: 1,
        playerName: 'Alice'
      }));
      expect(component.isSeatDialogOpen()).toBe(false);
    });

    it('should not send event when form is invalid', () => {
      component.selectedSeat.set(1);
      component.seatFormGroup.patchValue({ name: '' });
      
      component.takeSeat();
      
      expect(mockMultiplayerService.sendTakeSeatEvent).not.toHaveBeenCalled();
    });

    it('should not send event when no seat selected', () => {
      component.selectedSeat.set(null);
      component.seatFormGroup.patchValue({ name: 'Alice' });
      
      component.takeSeat();
      
      expect(mockMultiplayerService.sendTakeSeatEvent).not.toHaveBeenCalled();
    });

    it('should trim and limit name to 16 characters', () => {
      component.game.update(g => ({ ...g, playerId: 'spectator', gameId: 'game-id' }));
      component.selectedSeat.set(1);
      const paddedName = '  MyPlayerName  ';
      component.seatFormGroup.patchValue({ name: paddedName });
      
      component.takeSeat();
      
      const expectedName = paddedName.trim().slice(0, 16);
      expect(mockMultiplayerService.sendTakeSeatEvent).toHaveBeenCalledWith(jasmine.objectContaining({
        playerName: expectedName
      }));
    });
  });

  describe('form validation', () => {
    it('should require name field', () => {
      const control = component.seatName;
      control.setValue('');
      expect(control.hasError('required')).toBe(true);
    });

    it('should enforce maximum length of 16', () => {
      const control = component.seatName;
      control.setValue('A'.repeat(17));
      expect(control.hasError('maxlength')).toBe(true);
    });

    it('should be valid with proper length', () => {
      const control = component.seatName;
      control.setValue('Alice');
      expect(control.valid).toBe(true);
    });
  });
});
