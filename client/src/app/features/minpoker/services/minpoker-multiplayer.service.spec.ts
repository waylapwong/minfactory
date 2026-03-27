import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MINPOKER_SOCKET_REPOSITORY_MOCK } from '../mocks/minpoker-socket.repository.mock';
import { MinPokerMatchCommand } from '../models/enums/minpoker-match-command.enum';
import { MinPokerMatchEvent } from '../models/enums/minpoker-match-event.enum';
import { MinPokerMatchConnectedPayload } from '../models/payloads/minpoker-match-connected.payload';
import { MinPokerMatchJoinPayload } from '../models/payloads/minpoker-match-join.payload';
import { MinPokerMatchSeatPayload } from '../models/payloads/minpoker-match-seat.payload';
import { MinPokerMatchUpdatedPayload } from '../models/payloads/minpoker-match-updated.payload';
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

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinPokerSocketRepository, useValue: MINPOKER_SOCKET_REPOSITORY_MOCK },
      ],
    });
    service = TestBed.inject(MinPokerMultiplayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('connect()', () => {
    it('should call socketRepository connect', () => {
      service.connect();

      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.connect).toHaveBeenCalledTimes(1);
    });

    it('should subscribe to Connected and Updated events', () => {
      service.connect();

      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.on).toHaveBeenCalledWith(
        MinPokerMatchEvent.Connected,
        jasmine.any(Function),
      );
      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.on).toHaveBeenCalledWith(
        MinPokerMatchEvent.Updated,
        jasmine.any(Function),
      );
    });

    it('should only subscribe once even when called multiple times', () => {
      service.connect();
      service.connect();
      service.connect();

      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.on).toHaveBeenCalledTimes(2);
    });
  });

  describe('disconnect()', () => {
    it('should call socketRepository disconnect', () => {
      service.disconnect();

      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe from events when connected', () => {
      service.connect();
      service.disconnect();

      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.off).toHaveBeenCalledWith(
        MinPokerMatchEvent.Connected,
        jasmine.any(Function),
      );
      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.off).toHaveBeenCalledWith(
        MinPokerMatchEvent.Updated,
        jasmine.any(Function),
      );
    });

    it('should not unsubscribe if not connected', () => {
      service.disconnect();

      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.off).not.toHaveBeenCalled();
    });

    it('should only unsubscribe once for multiple disconnects after connect', () => {
      service.connect();
      service.disconnect();
      service.disconnect();

      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.off).toHaveBeenCalledTimes(2);
    });
  });

  describe('seatGame()', () => {
    it('should emit Seat command', () => {
      service.seatGame('Chris', 'man-1.svg', 2);

      expect(MINPOKER_SOCKET_REPOSITORY_MOCK.emit).toHaveBeenCalledWith(MinPokerMatchCommand.Seat, jasmine.any(Object));
    });

    it('should emit Seat command as MinPokerMatchSeatPayload with correct values', () => {
      service.setGameId('match-42');

      const connectedPayload: MinPokerMatchConnectedPayload = { playerId: 'player-1' };
      service.connect();
      const connectedCb = MINPOKER_SOCKET_REPOSITORY_MOCK.on.calls
        .all()
        .find((c) => c.args[0] === MinPokerMatchEvent.Connected)!.args[1] as (p: MinPokerMatchConnectedPayload) => void;
      connectedCb(connectedPayload);
      MINPOKER_SOCKET_REPOSITORY_MOCK.emit.calls.reset();

      service.seatGame('Chris', 'man-1.svg', 2);

      const emitArgs = MINPOKER_SOCKET_REPOSITORY_MOCK.emit.calls.mostRecent().args;
      expect(emitArgs[0]).toBe(MinPokerMatchCommand.Seat);
      expect(emitArgs[1]).toBeInstanceOf(MinPokerMatchSeatPayload);
      expect((emitArgs[1] as MinPokerMatchSeatPayload).playerName).toBe('Chris');
      expect((emitArgs[1] as MinPokerMatchSeatPayload).avatar).toBe('man-1.svg');
      expect((emitArgs[1] as MinPokerMatchSeatPayload).seat).toBe(2);
      expect((emitArgs[1] as MinPokerMatchSeatPayload).matchId).toBe('match-42');
      expect((emitArgs[1] as MinPokerMatchSeatPayload).playerId).toBe('player-1');
    });
  });

  describe('setGameId()', () => {
    it('should update the game id in the domain', () => {
      service.setGameId('new-game-id');

      expect(service.game().gameId).toBe('new-game-id');
    });
  });

  describe('game signal', () => {
    it('should return initial game view model', () => {
      expect(service.game()).toBeDefined();
    });

    it('should update seats when match updated event fires', () => {
      const updatedPayload: MinPokerMatchUpdatedPayload = {
        bigBlind: 20,
        matchId: 'game-1',
        name: 'Test Table',
        observerIds: [],
        players: [{ avatar: 'man-1.svg', id: 'player-1', name: 'Chris', seat: 0 }],
        smallBlind: 10,
        tableSize: 6,
      };

      service.connect();
      const updatedCb = MINPOKER_SOCKET_REPOSITORY_MOCK.on.calls
        .all()
        .find((c) => c.args[0] === MinPokerMatchEvent.Updated)!.args[1] as (p: MinPokerMatchUpdatedPayload) => void;
      updatedCb(updatedPayload);

      expect(service.game().gameId).toBe('game-1');
      expect(service.game().seats[0]).toEqual(
        jasmine.objectContaining({ name: 'Chris', avatar: 'man-1.svg', seat: 0 }),
      );
      expect(service.game().seats[1]).toBeNull();
    });
  });

  describe('playerId signal', () => {
    it('should return empty string initially', () => {
      expect(service.playerId()).toBe('');
    });

    it('should update when connected event fires', () => {
      const connectedPayload: MinPokerMatchConnectedPayload = { playerId: 'player-123' };

      service.connect();
      const connectedCb = MINPOKER_SOCKET_REPOSITORY_MOCK.on.calls
        .all()
        .find((c) => c.args[0] === MinPokerMatchEvent.Connected)!.args[1] as (p: MinPokerMatchConnectedPayload) => void;
      connectedCb(connectedPayload);

      expect(service.playerId()).toBe('player-123');
    });
  });

  describe('onMatchConnectedEvent', () => {
    it('should set playerId and emit Join command', () => {
      const connectedPayload: MinPokerMatchConnectedPayload = { playerId: 'player-42' };
      service.setGameId('game-99');

      service.connect();
      const connectedCb = MINPOKER_SOCKET_REPOSITORY_MOCK.on.calls
        .all()
        .find((c) => c.args[0] === MinPokerMatchEvent.Connected)!.args[1] as (p: MinPokerMatchConnectedPayload) => void;
      connectedCb(connectedPayload);

      expect(service.playerId()).toBe('player-42');
      const emitArgs = MINPOKER_SOCKET_REPOSITORY_MOCK.emit.calls.mostRecent().args;
      expect(emitArgs[0]).toBe(MinPokerMatchCommand.Join);
      expect(emitArgs[1]).toBeInstanceOf(MinPokerMatchJoinPayload);
      expect((emitArgs[1] as MinPokerMatchJoinPayload).playerId).toBe('player-42');
      expect((emitArgs[1] as MinPokerMatchJoinPayload).matchId).toBe('game-99');
    });
  });
});
