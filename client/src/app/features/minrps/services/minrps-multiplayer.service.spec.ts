import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MinRpsMove } from '../../../core/generated';
import { MinRpsGameEvent } from '../models/enums/minrps-game-event.enum';
import { MinRpsJoinPayload } from '../models/payloads/minrps-join.payload';
import { MinRpsLeavePayload } from '../models/payloads/minrps-leave.payload';
import { MinRpsPlayPayload } from '../models/payloads/minrps-play.payload';
import { MinRpsSelectMovePayload } from '../models/payloads/minrps-select-move.payload';
import { MinRpsTakeSeatPayload } from '../models/payloads/minrps-take-seat.payload';
import { MinRpsSocketRepository } from '../repositories/minrps-socket.repository';
import { MinRpsMultiplayerService } from './minrps-multiplayer.service';

describe('MinRpsMultiplayerService', () => {
  let service: MinRpsMultiplayerService;
  let mockSocketRepository: jasmine.SpyObj<MinRpsSocketRepository>;

  beforeEach(() => {
    mockSocketRepository = jasmine.createSpyObj('MinRpsSocketRepository', [
      'connect',
      'disconnect',
      'on',
      'off',
      'emit',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinRpsSocketRepository, useValue: mockSocketRepository },
      ],
    });
    service = TestBed.inject(MinRpsMultiplayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('connect()', () => {
    it('should call socketRepository connect', () => {
      service.connect();

      expect(mockSocketRepository.connect).toHaveBeenCalledTimes(1);
    });

    it('should call connect multiple times if called multiple times', () => {
      service.connect();
      service.connect();
      service.connect();

      expect(mockSocketRepository.connect).toHaveBeenCalledTimes(3);
    });
  });

  describe('disconnect()', () => {
    it('should call socketRepository disconnect', () => {
      service.disconnect();

      expect(mockSocketRepository.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should call disconnect multiple times if called multiple times', () => {
      service.disconnect();
      service.disconnect();

      expect(mockSocketRepository.disconnect).toHaveBeenCalledTimes(2);
    });
  });

  describe('onEvent()', () => {
    it('should call socketRepository on with correct event and callback', () => {
      const callback = jasmine.createSpy('callback');

      service.onEvent(MinRpsGameEvent.Connected, callback);

      expect(mockSocketRepository.on).toHaveBeenCalledWith(MinRpsGameEvent.Connected, callback);
    });

    it('should handle Joined event', () => {
      const callback = jasmine.createSpy('callback');

      service.onEvent(MinRpsGameEvent.Joined, callback);

      expect(mockSocketRepository.on).toHaveBeenCalledWith(MinRpsGameEvent.Joined, callback);
    });

    it('should handle Left event', () => {
      const callback = jasmine.createSpy('callback');

      service.onEvent(MinRpsGameEvent.Left, callback);

      expect(mockSocketRepository.on).toHaveBeenCalledWith(MinRpsGameEvent.Left, callback);
    });

    it('should handle MoveSelected event', () => {
      const callback = jasmine.createSpy('callback');

      service.onEvent(MinRpsGameEvent.MoveSelected, callback);

      expect(mockSocketRepository.on).toHaveBeenCalledWith(MinRpsGameEvent.MoveSelected, callback);
    });

    it('should handle Played event', () => {
      const callback = jasmine.createSpy('callback');

      service.onEvent(MinRpsGameEvent.Played, callback);

      expect(mockSocketRepository.on).toHaveBeenCalledWith(MinRpsGameEvent.Played, callback);
    });

    it('should handle GameStateUpdate event', () => {
      const callback = jasmine.createSpy('callback');

      service.onEvent(MinRpsGameEvent.GameStateUpdate, callback);

      expect(mockSocketRepository.on).toHaveBeenCalledWith(
        MinRpsGameEvent.GameStateUpdate,
        callback,
      );
    });

    it('should handle Disconnected event', () => {
      const callback = jasmine.createSpy('callback');

      service.onEvent(MinRpsGameEvent.Disconnected, callback);

      expect(mockSocketRepository.on).toHaveBeenCalledWith(MinRpsGameEvent.Disconnected, callback);
    });

    it('should register multiple callbacks for same event', () => {
      const callback1 = jasmine.createSpy('callback1');
      const callback2 = jasmine.createSpy('callback2');

      service.onEvent(MinRpsGameEvent.Connected, callback1);
      service.onEvent(MinRpsGameEvent.Connected, callback2);

      expect(mockSocketRepository.on).toHaveBeenCalledTimes(2);
      expect(mockSocketRepository.on).toHaveBeenCalledWith(MinRpsGameEvent.Connected, callback1);
      expect(mockSocketRepository.on).toHaveBeenCalledWith(MinRpsGameEvent.Connected, callback2);
    });
  });

  describe('offEvent()', () => {
    it('should call socketRepository off with correct event and callback', () => {
      const callback = jasmine.createSpy('callback');

      service.offEvent(MinRpsGameEvent.Connected, callback);

      expect(mockSocketRepository.off).toHaveBeenCalledWith(MinRpsGameEvent.Connected, callback);
    });

    it('should handle Joined event', () => {
      const callback = jasmine.createSpy('callback');

      service.offEvent(MinRpsGameEvent.Joined, callback);

      expect(mockSocketRepository.off).toHaveBeenCalledWith(MinRpsGameEvent.Joined, callback);
    });

    it('should handle Left event', () => {
      const callback = jasmine.createSpy('callback');

      service.offEvent(MinRpsGameEvent.Left, callback);

      expect(mockSocketRepository.off).toHaveBeenCalledWith(MinRpsGameEvent.Left, callback);
    });

    it('should handle MoveSelected event', () => {
      const callback = jasmine.createSpy('callback');

      service.offEvent(MinRpsGameEvent.MoveSelected, callback);

      expect(mockSocketRepository.off).toHaveBeenCalledWith(MinRpsGameEvent.MoveSelected, callback);
    });

    it('should handle Played event', () => {
      const callback = jasmine.createSpy('callback');

      service.offEvent(MinRpsGameEvent.Played, callback);

      expect(mockSocketRepository.off).toHaveBeenCalledWith(MinRpsGameEvent.Played, callback);
    });

    it('should handle GameStateUpdate event', () => {
      const callback = jasmine.createSpy('callback');

      service.offEvent(MinRpsGameEvent.GameStateUpdate, callback);

      expect(mockSocketRepository.off).toHaveBeenCalledWith(
        MinRpsGameEvent.GameStateUpdate,
        callback,
      );
    });

    it('should handle Disconnected event', () => {
      const callback = jasmine.createSpy('callback');

      service.offEvent(MinRpsGameEvent.Disconnected, callback);

      expect(mockSocketRepository.off).toHaveBeenCalledWith(MinRpsGameEvent.Disconnected, callback);
    });

    it('should unregister specific callback', () => {
      const callback = jasmine.createSpy('callback');

      service.offEvent(MinRpsGameEvent.Join, callback);

      expect(mockSocketRepository.off).toHaveBeenCalledWith(MinRpsGameEvent.Join, callback);
    });
  });

  describe('sendJoinEvent()', () => {
    it('should emit Join event with payload', () => {
      const payload: MinRpsJoinPayload = { gameId: 'test-game-id', playerId: 'player-1' };

      service.sendJoinEvent(payload);

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.Join, payload);
    });

    it('should handle different game IDs', () => {
      const payload1: MinRpsJoinPayload = { gameId: 'game-1', playerId: 'player-1' };
      const payload2: MinRpsJoinPayload = { gameId: 'game-2', playerId: 'player-2' };

      service.sendJoinEvent(payload1);
      service.sendJoinEvent(payload2);

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.Join, payload1);
      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.Join, payload2);
    });
  });

  describe('sendLeaveEvent()', () => {
    it('should emit Leave event with payload', () => {
      const payload: MinRpsLeavePayload = { gameId: 'test-game-id', playerId: 'player-1' };

      service.sendLeaveEvent(payload);

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.Leave, payload);
    });

    it('should handle different game IDs', () => {
      const payload1: MinRpsLeavePayload = { gameId: 'game-1', playerId: 'player-1' };
      const payload2: MinRpsLeavePayload = { gameId: 'game-2', playerId: 'player-2' };

      service.sendLeaveEvent(payload1);
      service.sendLeaveEvent(payload2);

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.Leave, payload1);
      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.Leave, payload2);
    });
  });

  describe('sendTakeSeatEvent()', () => {
    it('should emit TakeSeat event with payload for player 1', () => {
      const payload: MinRpsTakeSeatPayload = {
        gameId: 'test-game-id',
        playerId: 'player-1',
        seat: 1,
        playerName: 'Player 1',
      };

      service.sendTakeSeatEvent(payload);

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.TakeSeat, payload);
    });

    it('should emit TakeSeat event with payload for player 2', () => {
      const payload: MinRpsTakeSeatPayload = {
        gameId: 'test-game-id',
        playerId: 'player-2',
        seat: 2,
        playerName: 'Player 2',
      };

      service.sendTakeSeatEvent(payload);

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.TakeSeat, payload);
    });

    it('should handle different game IDs and player numbers', () => {
      const payload1: MinRpsTakeSeatPayload = {
        gameId: 'game-1',
        playerId: 'player-1',
        seat: 1,
        playerName: 'Player 1',
      };
      const payload2: MinRpsTakeSeatPayload = {
        gameId: 'game-2',
        playerId: 'player-2',
        seat: 2,
        playerName: 'Player 2',
      };

      service.sendTakeSeatEvent(payload1);
      service.sendTakeSeatEvent(payload2);

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.TakeSeat, payload1);
      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.TakeSeat, payload2);
    });
  });

  describe('sendSelectMoveEvent()', () => {
    it('should emit SelectMove event with payload', () => {
      const payload: MinRpsSelectMovePayload = {
        gameId: 'test-game-id',
        playerId: 'player-1',
        move: MinRpsMove.Rock,
      };

      service.sendSelectMoveEvent(payload);

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.SelectMove, payload);
    });

    it('should handle paper move', () => {
      const payload: MinRpsSelectMovePayload = {
        gameId: 'test-game-id',
        playerId: 'player-1',
        move: MinRpsMove.Paper,
      };

      service.sendSelectMoveEvent(payload);

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.SelectMove, payload);
    });

    it('should handle scissors move', () => {
      const payload: MinRpsSelectMovePayload = {
        gameId: 'test-game-id',
        playerId: 'player-2',
        move: MinRpsMove.Scissors,
      };

      service.sendSelectMoveEvent(payload);

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.SelectMove, payload);
    });

    it('should handle different players selecting moves', () => {
      const payload1: MinRpsSelectMovePayload = {
        gameId: 'game-1',
        playerId: 'player-1',
        move: MinRpsMove.Rock,
      };
      const payload2: MinRpsSelectMovePayload = {
        gameId: 'game-1',
        playerId: 'player-2',
        move: MinRpsMove.Scissors,
      };

      service.sendSelectMoveEvent(payload1);
      service.sendSelectMoveEvent(payload2);

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.SelectMove, payload1);
      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.SelectMove, payload2);
    });
  });

  describe('sendPlayEvent()', () => {
    it('should emit Play event with payload', () => {
      const payload: MinRpsPlayPayload = { gameId: 'test-game-id', playerId: 'player-1' };

      service.sendPlayEvent(payload);

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.Play, payload);
    });

    it('should handle different game IDs', () => {
      const payload1: MinRpsPlayPayload = { gameId: 'game-1', playerId: 'player-1' };
      const payload2: MinRpsPlayPayload = { gameId: 'game-2', playerId: 'player-2' };

      service.sendPlayEvent(payload1);
      service.sendPlayEvent(payload2);

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.Play, payload1);
      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.Play, payload2);
    });

    it('should emit Play event multiple times for same game', () => {
      const payload: MinRpsPlayPayload = { gameId: 'game-1', playerId: 'player-1' };

      service.sendPlayEvent(payload);
      service.sendPlayEvent(payload);

      expect(mockSocketRepository.emit).toHaveBeenCalledTimes(2);
      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.Play, payload);
    });
  });

  describe('integration scenarios', () => {
    it('should handle full connection lifecycle', () => {
      const connectCallback = jasmine.createSpy('connectCallback');
      const disconnectCallback = jasmine.createSpy('disconnectCallback');

      service.connect();
      service.onEvent(MinRpsGameEvent.Connected, connectCallback);
      service.disconnect();
      service.onEvent(MinRpsGameEvent.Disconnected, disconnectCallback);

      expect(mockSocketRepository.connect).toHaveBeenCalled();
      expect(mockSocketRepository.disconnect).toHaveBeenCalled();
      expect(mockSocketRepository.on).toHaveBeenCalledWith(
        MinRpsGameEvent.Connected,
        connectCallback,
      );
      expect(mockSocketRepository.on).toHaveBeenCalledWith(
        MinRpsGameEvent.Disconnected,
        disconnectCallback,
      );
    });

    it('should handle full game flow events', () => {
      const joinPayload: MinRpsJoinPayload = { gameId: 'game-1', playerId: 'player-1' };
      const takeSeatPayload: MinRpsTakeSeatPayload = {
        gameId: 'game-1',
        playerId: 'player-1',
        seat: 1,
        playerName: 'Player 1',
      };
      const selectMovePayload: MinRpsSelectMovePayload = {
        gameId: 'game-1',
        playerId: 'player-1',
        move: MinRpsMove.Rock,
      };
      const playPayload: MinRpsPlayPayload = { gameId: 'game-1', playerId: 'player-1' };
      const leavePayload: MinRpsLeavePayload = { gameId: 'game-1', playerId: 'player-1' };

      service.sendJoinEvent(joinPayload);
      service.sendTakeSeatEvent(takeSeatPayload);
      service.sendSelectMoveEvent(selectMovePayload);
      service.sendPlayEvent(playPayload);
      service.sendLeaveEvent(leavePayload);

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.Join, joinPayload);
      expect(mockSocketRepository.emit).toHaveBeenCalledWith(
        MinRpsGameEvent.TakeSeat,
        takeSeatPayload,
      );
      expect(mockSocketRepository.emit).toHaveBeenCalledWith(
        MinRpsGameEvent.SelectMove,
        selectMovePayload,
      );
      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.Play, playPayload);
      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsGameEvent.Leave, leavePayload);
    });
  });
});
