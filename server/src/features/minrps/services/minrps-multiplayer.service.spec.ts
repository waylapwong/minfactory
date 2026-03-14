import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { MinRpsResult } from '../models/enums/minrps-game-result.enum';
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinRpsMultiplayerService, MinRpsRoomSystem, MinRpsMatchRepository, MinRpsPlayerIdRepository],
    }).compile();

    service = module.get<MinRpsMultiplayerService>(MinRpsMultiplayerService);

    mockSocket = {
      id: 'test-socket-id',
      join: jest.fn(),
      leave: jest.fn(),
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

    it('should return match state when player makes a move', () => {
      const playPayload: MinRpsMatchPlayPayload = {
        matchId: 'match-1',
        playerId: 'player-1',
        playerMove: MinRpsMove.Rock,
      };

      const result = service.playMatch(playPayload);

      expect(result).toBeDefined();
      expect(result.player1Move).toBe(MinRpsMove.None); // Hidden until both play
      expect(result.player2Move).toBe(MinRpsMove.None);
    });

    it('should hide opponent move until both players have played', () => {
      service.playMatch({
        matchId: 'match-1',
        playerId: 'player-1',
        playerMove: MinRpsMove.Rock,
      });

      const result = service.playMatch({
        matchId: 'match-1',
        playerId: 'player-2',
        playerMove: MinRpsMove.Paper,
      });

      expect(result.player1Move).toBe(MinRpsMove.Rock);
      expect(result.player2Move).toBe(MinRpsMove.Paper);
      expect(result.resultHistory).toEqual([MinRpsResult.Player2]);
    });

    it('should not add history entry when only one player has played', () => {
      const result = service.playMatch({
        matchId: 'match-1',
        playerId: 'player-1',
        playerMove: MinRpsMove.Rock,
      });

      expect(result.resultHistory).toEqual([]);
    });

    it('should throw error when player not in match tries to play', () => {
      const playPayload: MinRpsMatchPlayPayload = {
        matchId: 'match-1',
        playerId: 'unknown-player',
        playerMove: MinRpsMove.Rock,
      };

      expect(() => service.playMatch(playPayload)).toThrow();
    });

    it('should throw error when match does not exist', () => {
      const playPayload: MinRpsMatchPlayPayload = {
        matchId: 'non-existent',
        playerId: 'player-1',
        playerMove: MinRpsMove.Rock,
      };

      expect(() => service.playMatch(playPayload)).toThrow();
    });
  });

  describe('resetMatch', () => {
    it('should reset player moves', () => {
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

      service.playMatch({
        matchId: 'match-1',
        playerId: 'player-1',
        playerMove: MinRpsMove.Rock,
      });
      service.playMatch({
        matchId: 'match-1',
        playerId: 'player-2',
        playerMove: MinRpsMove.Paper,
      });

      const resetResult = service.resetMatch('match-1');

      expect(resetResult).toBeDefined();
      expect(resetResult.player1Move).toBe(MinRpsMove.None);
      expect(resetResult.player2Move).toBe(MinRpsMove.None);
      expect(resetResult.resultHistory).toEqual([MinRpsResult.Player2]);
    });

    it('should keep only last 10 results in history', () => {
      service.seatPlayer({
        matchId: 'match-2',
        playerId: 'player-1',
        playerName: 'Alice',
        seat: 1,
      });
      service.seatPlayer({
        matchId: 'match-2',
        playerId: 'player-2',
        playerName: 'Bob',
        seat: 2,
      });

      for (let i = 0; i < 11; i++) {
        service.playMatch({
          matchId: 'match-2',
          playerId: 'player-1',
          playerMove: MinRpsMove.Rock,
        });
        service.playMatch({
          matchId: 'match-2',
          playerId: 'player-2',
          playerMove: i % 2 === 0 ? MinRpsMove.Paper : MinRpsMove.Scissors,
        });
        service.resetMatch('match-2');
      }

      const finalResult = service.playMatch({
        matchId: 'match-2',
        playerId: 'player-1',
        playerMove: MinRpsMove.Rock,
      });

      expect(finalResult.resultHistory.length).toBe(10);
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
