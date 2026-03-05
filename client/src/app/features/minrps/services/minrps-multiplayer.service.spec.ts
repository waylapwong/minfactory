import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MinRpsMove, MinRpsResult } from '../../../core/generated';
import { MinRpsMatchCommand } from '../models/enums/minrps-match-command.enum';
import { MinRpsMatchEvent } from '../models/enums/minrps-match-event.enum';
import { MinRpsMatchConnectedPayload } from '../models/payloads/minrps-match-connected.payload';
import { MinRpsMatchLeavePayload } from '../models/payloads/minrps-match-leave.payload';
import { MinRpsMatchPlayPayload } from '../models/payloads/minrps-match-play.payload';
import { MinRpsMatchSeatPayload } from '../models/payloads/minrps-match-seat.payload';
import { MinRpsMatchUpdatedPayload } from '../models/payloads/minrps-match-updated.payload';
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

    it('should subscribe to Connected and Updated events', () => {
      service.connect();

      expect(mockSocketRepository.on).toHaveBeenCalledWith(MinRpsMatchEvent.Connected, jasmine.any(Function));
      expect(mockSocketRepository.on).toHaveBeenCalledWith(MinRpsMatchEvent.Updated, jasmine.any(Function));
    });

    it('should only subscribe once even when called multiple times', () => {
      service.connect();
      service.connect();
      service.connect();

      expect(mockSocketRepository.on).toHaveBeenCalledTimes(2);
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

    it('should unsubscribe from events when connected', () => {
      service.connect();
      service.disconnect();

      expect(mockSocketRepository.off).toHaveBeenCalledWith(MinRpsMatchEvent.Connected, jasmine.any(Function));
      expect(mockSocketRepository.off).toHaveBeenCalledWith(MinRpsMatchEvent.Updated, jasmine.any(Function));
    });

    it('should not unsubscribe if not connected', () => {
      service.disconnect();

      expect(mockSocketRepository.off).not.toHaveBeenCalled();
    });

    it('should call disconnect multiple times if called multiple times', () => {
      service.disconnect();
      service.disconnect();

      expect(mockSocketRepository.disconnect).toHaveBeenCalledTimes(2);
    });

    it('should only unsubscribe once for multiple disconnects after connect', () => {
      service.connect();
      service.disconnect();
      service.disconnect();

      expect(mockSocketRepository.off).toHaveBeenCalledTimes(2);
    });
  });

  describe('joinGame()', () => {
    it('should emit Join command with matchId and playerId', () => {
      service.setGameId('game-1');
      service.joinGame();

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(
        MinRpsMatchCommand.Join,
        jasmine.objectContaining({ matchId: 'game-1' }),
      );
    });

    it('should emit Join command', () => {
      service.joinGame();

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsMatchCommand.Join, jasmine.any(Object));
    });
  });

  describe('leaveGame()', () => {
    it('should emit Leave command', () => {
      service.leaveGame();

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsMatchCommand.Leave, jasmine.any(Object));
    });

    it('should emit Leave command as MinRpsMatchLeavePayload', () => {
      service.leaveGame();

      const emitArgs = mockSocketRepository.emit.calls.mostRecent().args;
      expect(emitArgs[0]).toBe(MinRpsMatchCommand.Leave);
      expect(emitArgs[1]).toBeInstanceOf(MinRpsMatchLeavePayload);
    });
  });

  describe('playGame()', () => {
    it('should emit Play command', () => {
      service.playGame();

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsMatchCommand.Play, jasmine.any(Object));
    });

    it('should emit Play command as MinRpsMatchPlayPayload', () => {
      service.playGame();

      const emitArgs = mockSocketRepository.emit.calls.mostRecent().args;
      expect(emitArgs[0]).toBe(MinRpsMatchCommand.Play);
      expect(emitArgs[1]).toBeInstanceOf(MinRpsMatchPlayPayload);
    });
  });

  describe('seatGame()', () => {
    it('should emit Seat command', () => {
      service.seatGame();

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsMatchCommand.Seat, jasmine.any(Object));
    });

    it('should emit Seat command as MinRpsMatchSeatPayload', () => {
      service.seatGame();

      const emitArgs = mockSocketRepository.emit.calls.mostRecent().args;
      expect(emitArgs[0]).toBe(MinRpsMatchCommand.Seat);
      expect(emitArgs[1]).toBeInstanceOf(MinRpsMatchSeatPayload);
    });
  });

  describe('selectMove()', () => {
    it('should update player1 selected move when current player is player1', () => {
      const connectedPayload: MinRpsMatchConnectedPayload = { playerId: 'player-1' } as MinRpsMatchConnectedPayload;
      const updatedPayload: MinRpsMatchUpdatedPayload = {
        matchId: 'game-1',
        observers: [],
        player1Id: 'player-1',
        player1Move: MinRpsMove.None,
        player1Name: 'Player 1',
        player2Id: 'player-2',
        player2Move: MinRpsMove.None,
        player2Name: 'Player 2',
        result: MinRpsResult.None,
      };

      service.connect();

      const connectedCb = mockSocketRepository.on.calls.all().find((c) => c.args[0] === MinRpsMatchEvent.Connected)!
        .args[1];
      const updatedCb = mockSocketRepository.on.calls.all().find((c) => c.args[0] === MinRpsMatchEvent.Updated)!
        .args[1];

      updatedCb(updatedPayload);
      connectedCb(connectedPayload);

      service.selectMove(MinRpsMove.Rock);

      expect(service.game().heroSelectedMove).toBe(MinRpsMove.Rock);
    });

    it('should update player2 selected move when current player is player2', () => {
      const connectedPayload: MinRpsMatchConnectedPayload = { playerId: 'player-2' } as MinRpsMatchConnectedPayload;
      const updatedPayload: MinRpsMatchUpdatedPayload = {
        matchId: 'game-1',
        observers: [],
        player1Id: 'player-1',
        player1Move: MinRpsMove.None,
        player1Name: 'Player 1',
        player2Id: 'player-2',
        player2Move: MinRpsMove.None,
        player2Name: 'Player 2',
        result: MinRpsResult.None,
      };

      service.connect();

      const connectedCb = mockSocketRepository.on.calls.all().find((c) => c.args[0] === MinRpsMatchEvent.Connected)!
        .args[1];
      const updatedCb = mockSocketRepository.on.calls.all().find((c) => c.args[0] === MinRpsMatchEvent.Updated)!
        .args[1];

      updatedCb(updatedPayload);
      connectedCb(connectedPayload);

      service.selectMove(MinRpsMove.Paper);

      expect(service.game().heroSelectedMove).toBe(MinRpsMove.Paper);
    });

    it('should not update any move if player is neither player1 nor player2', () => {
      const connectedPayload: MinRpsMatchConnectedPayload = { playerId: 'spectator-id' } as MinRpsMatchConnectedPayload;
      const updatedPayload: MinRpsMatchUpdatedPayload = {
        matchId: 'game-1',
        observers: ['spectator-id'],
        player1Id: 'player-1',
        player1Move: MinRpsMove.None,
        player1Name: 'Player 1',
        player2Id: 'player-2',
        player2Move: MinRpsMove.None,
        player2Name: 'Player 2',
        result: MinRpsResult.None,
      };

      service.connect();

      const connectedCb = mockSocketRepository.on.calls.all().find((c) => c.args[0] === MinRpsMatchEvent.Connected)!
        .args[1];
      const updatedCb = mockSocketRepository.on.calls.all().find((c) => c.args[0] === MinRpsMatchEvent.Updated)!
        .args[1];

      updatedCb(updatedPayload);
      connectedCb(connectedPayload);

      service.selectMove(MinRpsMove.Rock);

      const game = service.game();
      expect(game.heroSelectedMove).toBe(MinRpsMove.None);
    });
  });

  describe('setGameId()', () => {
    it('should update the game id', () => {
      service.setGameId('new-game-id');

      service.joinGame();

      expect(mockSocketRepository.emit).toHaveBeenCalledWith(
        MinRpsMatchCommand.Join,
        jasmine.objectContaining({ matchId: 'new-game-id' }),
      );
    });
  });

  describe('game signal', () => {
    it('should return initial multiplayer viewmodel', () => {
      const game = service.game();

      expect(game).toBeDefined();
    });

    it('should update game signal when match updated event fires', () => {
      const updatedPayload: MinRpsMatchUpdatedPayload = {
        matchId: 'game-1',
        observers: [],
        player1Id: 'player-1',
        player1Move: MinRpsMove.Rock,
        player1Name: 'Player 1',
        player2Id: 'player-2',
        player2Move: MinRpsMove.Scissors,
        player2Name: 'Player 2',
        result: MinRpsResult.Player1,
      };

      service.connect();

      const updatedCb = mockSocketRepository.on.calls.all().find((c) => c.args[0] === MinRpsMatchEvent.Updated)!
        .args[1];
      updatedCb(updatedPayload);

      expect(service.game().result).toBe(MinRpsResult.Player1);
    });
  });

  describe('playerId signal', () => {
    it('should return empty string initially', () => {
      expect(service.playerId()).toBe('');
    });

    it('should update when connected event fires', () => {
      const connectedPayload: MinRpsMatchConnectedPayload = { playerId: 'player-123' } as MinRpsMatchConnectedPayload;

      service.connect();

      const connectedCb = mockSocketRepository.on.calls.all().find((c) => c.args[0] === MinRpsMatchEvent.Connected)!
        .args[1];
      connectedCb(connectedPayload);

      expect(service.playerId()).toBe('player-123');
    });
  });

  describe('onMatchConnectedEvent', () => {
    it('should set playerId and call joinGame on connected event', () => {
      const connectedPayload: MinRpsMatchConnectedPayload = { playerId: 'player-42' } as MinRpsMatchConnectedPayload;

      service.connect();

      const connectedCb = mockSocketRepository.on.calls.all().find((c) => c.args[0] === MinRpsMatchEvent.Connected)!
        .args[1];
      connectedCb(connectedPayload);

      expect(service.playerId()).toBe('player-42');
      expect(mockSocketRepository.emit).toHaveBeenCalledWith(MinRpsMatchCommand.Join, jasmine.any(Object));
    });
  });

  describe('onMatchUpdatedEvent', () => {
    it('should update game state on updated event', () => {
      const updatedPayload: MinRpsMatchUpdatedPayload = {
        matchId: 'game-xyz',
        observers: ['obs-1', 'obs-2'],
        player1Id: 'p1',
        player1Move: MinRpsMove.Paper,
        player1Name: 'Alice',
        player2Id: 'p2',
        player2Move: MinRpsMove.Scissors,
        player2Name: 'Bob',
        result: MinRpsResult.Player2,
      };

      service.connect();

      const updatedCb = mockSocketRepository.on.calls.all().find((c) => c.args[0] === MinRpsMatchEvent.Updated)!
        .args[1];
      updatedCb(updatedPayload);

      expect(service.game().result).toBe(MinRpsResult.Player2);
    });
  });
});
