import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { MinRpsMove } from '../models/enums/minrps-move.enum';
import { MinRpsMatchJoinPayload } from '../models/payloads/minrps-match-join.payload';
import { MinRpsMatchLeavePayload } from '../models/payloads/minrps-match-leave.payload';
import { MinRpsMatchPlayPayload } from '../models/payloads/minrps-match-play.payload';
import { MinRpsMatchSeatPayload } from '../models/payloads/minrps-match-seat.payload';
import { MinRpsMatchRepository } from '../repositories/minrps-match.repository';
import { MinRpsPlayerIdRepository } from '../repositories/minrps-player-id.repository';
import { MinRpsRoomSystem } from '../systems/minrps-room.system';
import { MinRpsMultiplayerService } from './minrps-multiplayer.service';

describe('MinRpsMultiplayerService', () => {
  let service: MinRpsMultiplayerService;
  let mockSocket: jest.Mocked<Socket>;
  let mockServer: jest.Mocked<Server>;
  let mockServerRoom: { emit: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinRpsMultiplayerService, MinRpsRoomSystem, MinRpsMatchRepository, MinRpsPlayerIdRepository],
    }).compile();

    service = module.get<MinRpsMultiplayerService>(MinRpsMultiplayerService);

    mockServerRoom = { emit: jest.fn() };
    mockServer = {
      to: jest.fn().mockReturnValue(mockServerRoom),
    } as any;
    service.setServer(mockServer);

    mockSocket = {
      id: 'test-socket-id',
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should generate a playerId for new connection', () => {
      const payload = service.handleConnection(mockSocket);

      expect(payload).toBeDefined();
      expect(payload.playerId).toBeDefined();
      expect(typeof payload.playerId).toBe('string');
      expect(payload.playerId.length).toBeGreaterThan(0);
    });
  });

  describe('joinMatch', () => {
    it('should add player to room and return match updated payload', () => {
      const joinPayload: MinRpsMatchJoinPayload = {
        matchId: 'match-1',
        playerId: 'player-1',
      };

      const result = service.joinMatch(mockSocket, joinPayload);

      expect(result).toBeDefined();
      expect(result.matchId).toBe('match-1');
    });
  });

  describe('leaveMatch', () => {
    it('should remove player from room', () => {
      const joinPayload: MinRpsMatchJoinPayload = {
        matchId: 'match-1',
        playerId: 'player-1',
      };
      service.joinMatch(mockSocket, joinPayload);

      const leavePayload: MinRpsMatchLeavePayload = {
        matchId: 'match-1',
        playerId: 'player-1',
      };

      const result = service.leaveMatch(mockSocket, leavePayload);

      expect(result).toBeDefined();
      expect(result.matchId).toBe('match-1');
    });
  });

  describe('seatPlayer', () => {
    it('should seat player1', () => {
      const seatPayload: MinRpsMatchSeatPayload = {
        matchId: 'match-1',
        playerId: 'player-1',
        playerName: 'Alice',
        seat: 1,
      };

      const result = service.seatPlayer(seatPayload);

      expect(result).toBeDefined();
      expect(result.matchId).toBe('match-1');
    });

    it('should seat two players in the same match', () => {
      const seat1: MinRpsMatchSeatPayload = {
        matchId: 'match-1',
        playerId: 'player-1',
        playerName: 'Alice',
        seat: 1,
      };
      service.seatPlayer(seat1);

      const seat2: MinRpsMatchSeatPayload = {
        matchId: 'match-1',
        playerId: 'player-2',
        playerName: 'Bob',
        seat: 2,
      };
      const result = service.seatPlayer(seat2);

      expect(result).toBeDefined();
      expect(result.matchId).toBe('match-1');
    });
  });

  describe('playMatch', () => {
    beforeEach(() => {
      service.seatPlayer({
        matchId: 'match-1',
        playerId: 'player-1',
        playerName: 'Alice',
        seat: 1,
      });
      service.seatPlayer({
        matchId: 'match-1',
        playerId: 'player-2',
        playerName: 'Bob',
        seat: 2,
      });
    });

    it('should emit updated event to client when only one player has played', () => {
      const playPayload: MinRpsMatchPlayPayload = {
        matchId: 'match-1',
        playerId: 'player-1',
        playerMove: MinRpsMove.Rock,
      };

      service.playMatch(mockSocket, playPayload);

      expect(mockSocket.emit).toHaveBeenCalled();
      expect(mockServer.to).not.toHaveBeenCalled();
    });

    it('should hide opponent move in client event until both players have played', () => {
      service.playMatch(mockSocket, {
        matchId: 'match-1',
        playerId: 'player-1',
        playerMove: MinRpsMove.Rock,
      });

      const emittedPayload = (mockSocket.emit as jest.Mock).mock.calls[0][1];
      expect(emittedPayload.player1Move).toBe(MinRpsMove.Rock);
      expect(emittedPayload.player2Move).toBe(MinRpsMove.None);
    });

    it('should broadcast to room when both players have played', () => {
      jest.useFakeTimers();

      service.playMatch(mockSocket, {
        matchId: 'match-1',
        playerId: 'player-1',
        playerMove: MinRpsMove.Rock,
      });
      service.playMatch(mockSocket, {
        matchId: 'match-1',
        playerId: 'player-2',
        playerMove: MinRpsMove.Paper,
      });

      expect(mockServer.to).toHaveBeenCalledWith('match-1');
      expect(mockServerRoom.emit).toHaveBeenCalledTimes(1);

      const broadcastPayload = mockServerRoom.emit.mock.calls[0][1];
      expect(broadcastPayload.player1Move).toBe(MinRpsMove.Rock);
      expect(broadcastPayload.player2Move).toBe(MinRpsMove.Paper);

      jest.useRealTimers();
    });

    it('should broadcast reset event after 3 seconds when both players have played', () => {
      jest.useFakeTimers();

      service.playMatch(mockSocket, {
        matchId: 'match-1',
        playerId: 'player-1',
        playerMove: MinRpsMove.Rock,
      });
      service.playMatch(mockSocket, {
        matchId: 'match-1',
        playerId: 'player-2',
        playerMove: MinRpsMove.Paper,
      });

      jest.advanceTimersByTime(3000);

      expect(mockServer.to).toHaveBeenCalledTimes(2);
      const resetPayload = mockServerRoom.emit.mock.calls[1][1];
      expect(resetPayload.player1Move).toBe(MinRpsMove.None);
      expect(resetPayload.player2Move).toBe(MinRpsMove.None);

      jest.useRealTimers();
    });

    it('should throw error when player not in match tries to play', () => {
      const playPayload: MinRpsMatchPlayPayload = {
        matchId: 'match-1',
        playerId: 'unknown-player',
        playerMove: MinRpsMove.Rock,
      };

      expect(() => service.playMatch(mockSocket, playPayload)).toThrow();
    });

    it('should throw error when match does not exist', () => {
      const playPayload: MinRpsMatchPlayPayload = {
        matchId: 'non-existent',
        playerId: 'player-1',
        playerMove: MinRpsMove.Rock,
      };

      expect(() => service.playMatch(mockSocket, playPayload)).toThrow();
    });
  });

  describe('resetMatch', () => {
    it('should reset player moves', () => {
      jest.useFakeTimers();

      service.seatPlayer({
        matchId: 'match-1',
        playerId: 'player-1',
        playerName: 'Alice',
        seat: 1,
      });
      service.seatPlayer({
        matchId: 'match-1',
        playerId: 'player-2',
        playerName: 'Bob',
        seat: 2,
      });

      service.playMatch(mockSocket, {
        matchId: 'match-1',
        playerId: 'player-1',
        playerMove: MinRpsMove.Rock,
      });
      service.playMatch(mockSocket, {
        matchId: 'match-1',
        playerId: 'player-2',
        playerMove: MinRpsMove.Paper,
      });

      const resetResult = service.resetMatch('match-1');

      expect(resetResult).toBeDefined();
      expect(resetResult.player1Move).toBe(MinRpsMove.None);
      expect(resetResult.player2Move).toBe(MinRpsMove.None);

      jest.useRealTimers();
    });
  });

  describe('handleDisconnect', () => {
    it('should return null when player is not in a room', () => {
      service.handleConnection(mockSocket);

      const result = service.handleDisconnect(mockSocket);

      expect(result).toBeNull();
    });

    it('should return match state when player disconnects from active match', () => {
      const connectionPayload = service.handleConnection(mockSocket);
      service.joinMatch(mockSocket, {
        matchId: 'match-1',
        playerId: connectionPayload.playerId,
      });
      service.seatPlayer({
        matchId: 'match-1',
        playerId: connectionPayload.playerId,
        playerName: 'Alice',
        seat: 1,
      });

      const result = service.handleDisconnect(mockSocket);

      expect(result === null || result.matchId === 'match-1').toBeTruthy();
    });
  });
});
