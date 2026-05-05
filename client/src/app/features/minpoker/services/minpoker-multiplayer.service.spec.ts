import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from '../../../core/authentication/authentication.service';
import { AUTHENTICATION_SERVICE_MOCK } from '../../../core/mocks/authentication.service.mock';
import { MINPOKER_SOCKET_REPOSITORY_MOCK } from '../mocks/minpoker-socket.repository.mock';
import { MinPokerMatchCommand } from '../models/enums/minpoker-match-command.enum';
import { MinPokerMatchEvent } from '../models/enums/minpoker-match-event.enum';
import { MinPokerMatchConnectedEvent } from '../models/events/minpoker-match-connected.event';
import { MinPokerMatchHandDealtEvent } from '../models/events/minpoker-match-hand-dealt.event';
import { MinPokerMatchJoinCommand } from '../models/commands/minpoker-match-join.command';
import { MinPokerMatchLeaveCommand } from '../models/commands/minpoker-match-leave.command';
import { MinPokerMatchSeatCommand } from '../models/commands/minpoker-match-seat.command';
import { MinPokerMatchUpdatedEvent } from '../models/events/minpoker-match-updated.event';
import { MinPokerSocketRepository } from '../repositories/minpoker-socket.repository';
import { MinPokerMultiplayerService } from './minpoker-multiplayer.service';

describe('MinPokerMultiplayerService', () => {
  let service: MinPokerMultiplayerService;

  beforeEach(() => {
    MINPOKER_SOCKET_REPOSITORY_MOCK.connect.calls.reset();
    MINPOKER_SOCKET_REPOSITORY_MOCK.disconnect.calls.reset();
    MINPOKER_SOCKET_REPOSITORY_MOCK.on.calls.reset();
    MINPOKER_SOCKET_REPOSITORY_MOCK.off.calls.reset();
    MINPOKER_SOCKET_REPOSITORY_MOCK.emit.calls.reset();
    AUTHENTICATION_SERVICE_MOCK.getIdToken.calls.reset();
    AUTHENTICATION_SERVICE_MOCK.getIdToken.and.returnValue(Promise.resolve('fake-token'));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinPokerSocketRepository, useValue: MINPOKER_SOCKET_REPOSITORY_MOCK },
        { provide: AuthenticationService, useValue: AUTHENTICATION_SERVICE_MOCK },
      ],
    });
    service = TestBed.inject(MinPokerMultiplayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('connect()', () => {
    it('should call socketRepository connect', async () => {
      await service.connect();

      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.connect).toHaveBeenCalledTimes(1);
    });

    it('should throw when authentication token is not available', async () => {
      AUTHENTICATION_SERVICE_MOCK.getIdToken.and.returnValue(Promise.resolve(null));

      await expectAsync(service.connect()).toBeRejectedWithError('Authentication token is not available');
      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.connect).not.toHaveBeenCalled();
    });

    it('should subscribe to Connected, HandDealt and Updated events', async () => {
      await service.connect();

      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.on).toHaveBeenCalledWith(MinPokerMatchEvent.Connected, jasmine.any(Function));
      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.on).toHaveBeenCalledWith(MinPokerMatchEvent.HandDealt, jasmine.any(Function));
      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.on).toHaveBeenCalledWith(MinPokerMatchEvent.Updated, jasmine.any(Function));
    });

    it('should only subscribe once even when called multiple times', async () => {
      await service.connect();
      await service.connect();
      await service.connect();

      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.on).toHaveBeenCalledTimes(3);
    });
  });

  describe('disconnect()', () => {
    it('should call socketRepository disconnect', () => {
      service.disconnect();

      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe from events when connected', async () => {
      await service.connect();
      service.disconnect();

      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.off).toHaveBeenCalledWith(MinPokerMatchEvent.Connected, jasmine.any(Function));
      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.off).toHaveBeenCalledWith(MinPokerMatchEvent.HandDealt, jasmine.any(Function));
      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.off).toHaveBeenCalledWith(MinPokerMatchEvent.Updated, jasmine.any(Function));
    });

    it('should not unsubscribe if not connected', () => {
      service.disconnect();

      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.off).not.toHaveBeenCalled();
    });

    it('should only unsubscribe once for multiple disconnects after connect', async () => {
      await service.connect();
      service.disconnect();
      service.disconnect();

      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.off).toHaveBeenCalledTimes(3);
    });
  });

  describe('seatGame()', () => {
    it('should not emit Seat command when playerId is missing', () => {
      service.setGameId('match-42');

      service.seatGame('Chris', 'man-1.svg', 2);

      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.emit).not.toHaveBeenCalled();
    });

    it('should not emit Seat command when matchId is missing', async () => {
      const connectedEvent: MinPokerMatchConnectedEvent = { playerId: 'player-1' };
      await service.connect();
      const connectedCb = MINPOKER_SOCKET_REPOSITORY_MOCK.on.calls.all().find((c) => c.args[0] === MinPokerMatchEvent.Connected)!
        .args[1] as (p: MinPokerMatchConnectedEvent) => void;
      connectedCb(connectedEvent);
      MINPOKER_SOCKET_REPOSITORY_MOCK.emit.calls.reset();

      service.seatGame('Chris', 'man-1.svg', 2);

      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.emit).not.toHaveBeenCalled();
    });

    it('should emit Seat command', async () => {
      service.setGameId('match-42');
      const connectedEvent: MinPokerMatchConnectedEvent = { playerId: 'player-1' };
      await service.connect();
      const connectedCb = MINPOKER_SOCKET_REPOSITORY_MOCK.on.calls.all().find((c) => c.args[0] === MinPokerMatchEvent.Connected)!
        .args[1] as (p: MinPokerMatchConnectedEvent) => void;
      connectedCb(connectedEvent);
      MINPOKER_SOCKET_REPOSITORY_MOCK.emit.calls.reset();

      service.seatGame('Chris', 'man-1.svg', 2);

      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.emit).toHaveBeenCalledWith(MinPokerMatchCommand.Seat, jasmine.any(Object));
    });

    it('should emit Seat command as MinPokerMatchSeatCommand with correct values', async () => {
      service.setGameId('match-42');

      const connectedEvent: MinPokerMatchConnectedEvent = { playerId: 'player-1' };
      await service.connect();
      const connectedCb = MINPOKER_SOCKET_REPOSITORY_MOCK.on.calls.all().find((c) => c.args[0] === MinPokerMatchEvent.Connected)!
        .args[1] as (p: MinPokerMatchConnectedEvent) => void;
      connectedCb(connectedEvent);
      MINPOKER_SOCKET_REPOSITORY_MOCK.emit.calls.reset();

      service.seatGame('Chris', 'man-1.svg', 2);

      const emitArgs = MINPOKER_SOCKET_REPOSITORY_MOCK.emit.calls.mostRecent().args;
      expect(emitArgs[0]).toBe(MinPokerMatchCommand.Seat);
      expect(emitArgs[1]).toBeInstanceOf(MinPokerMatchSeatCommand);
      expect((emitArgs[1] as MinPokerMatchSeatCommand).playerName).toBe('Chris');
      expect((emitArgs[1] as MinPokerMatchSeatCommand).avatar).toBe('man-1.svg');
      expect((emitArgs[1] as MinPokerMatchSeatCommand).seat).toBe(2);
      expect((emitArgs[1] as MinPokerMatchSeatCommand).matchId).toBe('match-42');
      expect((emitArgs[1] as MinPokerMatchSeatCommand).playerId).toBe('player-1');
    });
  });

  describe('setGameId()', () => {
    it('should update the game id in the domain', () => {
      service.setGameId('new-game-id');

      expect(service.game().gameId).toBe('new-game-id');
    });

    it('should clear the hand when switching to a different match', async () => {
      service.setGameId('game-1');
      await service.connect();
      const handDealtCb = MINPOKER_SOCKET_REPOSITORY_MOCK.on.calls.all().find((c) => c.args[0] === MinPokerMatchEvent.HandDealt)!
        .args[1] as (p: MinPokerMatchHandDealtEvent) => void;
      handDealtCb({ hand: ['Ah', 'Ks'] });
      expect(service.game().hand).toEqual(['Ah', 'Ks']);

      service.setGameId('game-2');

      expect(service.game().hand).toEqual([]);
    });

    it('should not reset match when same game id is set again', async () => {
      service.setGameId('game-1');
      await service.connect();
      const handDealtCb = MINPOKER_SOCKET_REPOSITORY_MOCK.on.calls.all().find((c) => c.args[0] === MinPokerMatchEvent.HandDealt)!
        .args[1] as (p: MinPokerMatchHandDealtEvent) => void;
      handDealtCb({ hand: ['Ah', 'Ks'] });

      service.setGameId('game-1');

      expect(service.game().hand).toEqual(['Ah', 'Ks']);
    });
  });

  describe('game signal', () => {
    it('should return initial game view model', () => {
      expect(service.game()).toBeDefined();
    });

    it('should update seats when match updated event fires', async () => {
      const updatedEvent: MinPokerMatchUpdatedEvent = {
        bigBlind: 20,
        matchId: 'game-1',
        name: 'Test Table',
        observerIds: [],
        players: [{ avatar: 'man-1.svg', id: 'player-1', name: 'Chris', seat: 0, stack: 200 }],
        smallBlind: 10,
        tableSize: 6,
      };

      await service.connect();
      const updatedCb = MINPOKER_SOCKET_REPOSITORY_MOCK.on.calls.all().find((c) => c.args[0] === MinPokerMatchEvent.Updated)!.args[1] as (
        p: MinPokerMatchUpdatedEvent,
      ) => void;
      updatedCb(updatedEvent);

      expect(service.game().gameId).toBe('game-1');
      expect(service.game().seats[0]).toEqual(jasmine.objectContaining({ name: 'Chris', avatar: 'man-1.svg', seat: 0, stack: 200 }));
      expect(service.game().seats[1]).toBeNull();
    });

    it('should preserve hand when match updated event fires', async () => {
      const handDealtEvent: MinPokerMatchHandDealtEvent = { hand: ['Ah', 'Ks'] };
      const updatedEvent: MinPokerMatchUpdatedEvent = {
        bigBlind: 20,
        matchId: 'game-1',
        name: 'Test Table',
        observerIds: [],
        players: [{ avatar: 'man-1.svg', id: 'player-1', name: 'Chris', seat: 0, stack: 200 }],
        smallBlind: 10,
        tableSize: 6,
      };

      service.setGameId('game-1');
      await service.connect();
      const handDealtCb = MINPOKER_SOCKET_REPOSITORY_MOCK.on.calls.all().find((c) => c.args[0] === MinPokerMatchEvent.HandDealt)!
        .args[1] as (p: MinPokerMatchHandDealtEvent) => void;
      const updatedCb = MINPOKER_SOCKET_REPOSITORY_MOCK.on.calls.all().find((c) => c.args[0] === MinPokerMatchEvent.Updated)!.args[1] as (
        p: MinPokerMatchUpdatedEvent,
      ) => void;

      handDealtCb(handDealtEvent);
      updatedCb(updatedEvent);

      expect(service.game().hand).toEqual(['Ah', 'Ks']);
    });

    it('should not preserve hand when updated event is for a different match', async () => {
      const handDealtEvent: MinPokerMatchHandDealtEvent = { hand: ['Ah', 'Ks'] };
      const updatedEventOtherMatch: MinPokerMatchUpdatedEvent = {
        bigBlind: 20,
        matchId: 'game-2',
        name: 'Other Table',
        observerIds: [],
        players: [],
        smallBlind: 10,
        tableSize: 6,
      };

      service.setGameId('game-1');
      await service.connect();
      const handDealtCb = MINPOKER_SOCKET_REPOSITORY_MOCK.on.calls.all().find((c) => c.args[0] === MinPokerMatchEvent.HandDealt)!
        .args[1] as (p: MinPokerMatchHandDealtEvent) => void;
      const updatedCb = MINPOKER_SOCKET_REPOSITORY_MOCK.on.calls.all().find((c) => c.args[0] === MinPokerMatchEvent.Updated)!.args[1] as (
        p: MinPokerMatchUpdatedEvent,
      ) => void;

      handDealtCb(handDealtEvent);
      updatedCb(updatedEventOtherMatch);

      expect(service.game().hand).toEqual([]);
    });
  });

  describe('onMatchHandDealtEvent', () => {
    it('should update the hand in the game view model', async () => {
      const handDealtEvent: MinPokerMatchHandDealtEvent = { hand: ['Ah', 'Ks'] };

      await service.connect();
      const handDealtCb = MINPOKER_SOCKET_REPOSITORY_MOCK.on.calls.all().find((c) => c.args[0] === MinPokerMatchEvent.HandDealt)!
        .args[1] as (p: MinPokerMatchHandDealtEvent) => void;
      handDealtCb(handDealtEvent);

      expect(service.game().hand).toEqual(['Ah', 'Ks']);
    });

    it('should return empty hand initially', () => {
      expect(service.game().hand).toEqual([]);
    });
  });

  describe('playerId signal', () => {
    it('should return empty string initially', () => {
      expect(service.playerId()).toBe('');
    });

    it('should update when connected event fires', async () => {
      const connectedEvent: MinPokerMatchConnectedEvent = { playerId: 'player-123' };

      await service.connect();
      const connectedCb = MINPOKER_SOCKET_REPOSITORY_MOCK.on.calls.all().find((c) => c.args[0] === MinPokerMatchEvent.Connected)!
        .args[1] as (p: MinPokerMatchConnectedEvent) => void;
      connectedCb(connectedEvent);

      expect(service.playerId()).toBe('player-123');
    });
  });

  describe('onMatchConnectedEvent', () => {
    it('should set playerId and emit Join command', async () => {
      const connectedEvent: MinPokerMatchConnectedEvent = { playerId: 'player-42' };
      service.setGameId('game-99');

      await service.connect();
      const connectedCb = MINPOKER_SOCKET_REPOSITORY_MOCK.on.calls.all().find((c) => c.args[0] === MinPokerMatchEvent.Connected)!
        .args[1] as (p: MinPokerMatchConnectedEvent) => void;
      connectedCb(connectedEvent);

      expect(service.playerId()).toBe('player-42');
      const emitArgs = MINPOKER_SOCKET_REPOSITORY_MOCK.emit.calls.mostRecent().args;
      expect(emitArgs[0]).toBe(MinPokerMatchCommand.Join);
      expect(emitArgs[1]).toBeInstanceOf(MinPokerMatchJoinCommand);
      expect((emitArgs[1] as MinPokerMatchJoinCommand).playerId).toBe('player-42');
      expect((emitArgs[1] as MinPokerMatchJoinCommand).matchId).toBe('game-99');
    });
  });

  describe('leaveGame()', () => {
    it('should emit Leave command', () => {
      service.leaveGame();

      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.emit).toHaveBeenCalledWith(MinPokerMatchCommand.Leave, jasmine.any(Object));
    });

    it('should emit Leave command as MinPokerMatchLeaveCommand with correct matchId and playerId', async () => {
      service.setGameId('match-42');

      const connectedEvent: MinPokerMatchConnectedEvent = { playerId: 'player-1' };
      await service.connect();
      const connectedCb = MINPOKER_SOCKET_REPOSITORY_MOCK.on.calls.all().find((c) => c.args[0] === MinPokerMatchEvent.Connected)!
        .args[1] as (p: MinPokerMatchConnectedEvent) => void;
      connectedCb(connectedEvent);
      MINPOKER_SOCKET_REPOSITORY_MOCK.emit.calls.reset();

      service.leaveGame();

      const emitArgs = MINPOKER_SOCKET_REPOSITORY_MOCK.emit.calls.mostRecent().args;
      expect(emitArgs[0]).toBe(MinPokerMatchCommand.Leave);
      expect(emitArgs[1]).toBeInstanceOf(MinPokerMatchLeaveCommand);
      expect((emitArgs[1] as MinPokerMatchLeaveCommand).matchId).toBe('match-42');
      expect((emitArgs[1] as MinPokerMatchLeaveCommand).playerId).toBe('player-1');
    });
  });
});
