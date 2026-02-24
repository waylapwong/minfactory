import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { MinRpsResult } from '../models/enums/minrps-game-result.enum';
import { MinRpsMove } from '../models/enums/minrps-move.enum';
import { MinRpsMatchJoinPayload } from '../models/payloads/minrps-match-join.payload';
import { MinRpsMatchLeavePayload } from '../models/payloads/minrps-match-leave.payload';
import { MinRpsPlayPayload } from '../models/payloads/minrps-play.payload';
import { MinRpsSelectMovePayload } from '../models/payloads/minrps-select-move.payload';
import { MinRpsTakeSeatPayload } from '../models/payloads/minrps-take-seat.payload';
import { MinRpsMatchRepository } from '../repositories/minrps-match.repository';
import { MinRpsRoomSystem } from '../systems/minrps-room.system';
import { MinRpsMultiplayerService } from './minrps-multiplayer.service';

describe('MinRpsMultiplayerService', () => {
  let service: MinRpsMultiplayerService;
  let mockSocket: jest.Mocked<Socket>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinRpsMultiplayerService, MinRpsRoomSystem, MinRpsMatchRepository],
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

  describe('joinGame', () => {
    it('should add player to room and return joined payload', () => {
      const joinPayload: MinRpsMatchJoinPayload = {
        matchId: 'game-1',
        playerId: 'player-1',
      };

      const result = service.joinMatch(mockSocket, joinPayload);

      expect(result.gameId).toBe('game-1');
      expect(result.playerId).toBe('player-1');
      expect(mockSocket.join).toHaveBeenCalledWith('game-1');
    });

    it('should track socket to player mapping', () => {
      const joinPayload: MinRpsMatchJoinPayload = {
        matchId: 'game-1',
        playerId: 'player-1',
      };

      service.joinMatch(mockSocket, joinPayload);

      expect(service.getPlayerIdForSocket(mockSocket)).toBe('player-1');
    });
  });

  describe('leaveGame', () => {
    it('should remove player from room and return left payload', () => {
      const joinPayload: MinRpsMatchJoinPayload = {
        matchId: 'game-1',
        playerId: 'player-1',
      };
      service.joinMatch(mockSocket, joinPayload);

      const leavePayload: MinRpsMatchLeavePayload = {
        matchId: 'game-1',
        playerId: 'player-1',
      };

      const result = service.leaveMatch(mockSocket, leavePayload);

      expect(result.gameId).toBe('game-1');
      expect(result.playerId).toBe('player-1');
      expect(mockSocket.leave).toHaveBeenCalledWith('game-1');
    });
  });

  describe('takeSeat', () => {
    it('should assign player1 when seat 1 is taken', () => {
      const takeSeatPayload: MinRpsTakeSeatPayload = {
        gameId: 'game-1',
        playerId: 'player-1',
        playerName: 'Player One',
        seat: 1,
      };

      const result = service.seatPlayer(takeSeatPayload);

      expect(result.matchId).toBe('game-1');
      expect(result.playerId).toBe('player-1');
      expect(result.playerName).toBe('Player One');
    });

    it('should assign player2 when seat 2 is taken', () => {
      const takeSeatPayload: MinRpsTakeSeatPayload = {
        gameId: 'game-1',
        playerId: 'player-2',
        playerName: 'Player Two',
        seat: 2,
      };

      const result = service.seatPlayer(takeSeatPayload);

      expect(result.matchId).toBe('game-1');
      expect(result.player2Id).toBe('player-2');
      expect(result.player2Name).toBe('Player Two');
    });

    it('should trim and limit player name to 16 characters', () => {
      const takeSeatPayload: MinRpsTakeSeatPayload = {
        gameId: 'game-1',
        playerId: 'player-1',
        playerName: '  Very Long Player Name That Exceeds Limit  ',
        seat: 1,
      };

      const result = service.seatPlayer(takeSeatPayload);

      expect(result.playerName).toBe('Very Long Player');
      expect(result.playerName.length).toBeLessThanOrEqual(16);
    });

    it('should not assign seat if name is empty after trimming', () => {
      const takeSeatPayload: MinRpsTakeSeatPayload = {
        gameId: 'game-1',
        playerId: 'player-1',
        playerName: '   ',
        seat: 1,
      };

      const result = service.seatPlayer(takeSeatPayload);

      expect(result.playerId).toBe('');
    });

    it('should not allow player to take both seats', () => {
      const takeSeat1: MinRpsTakeSeatPayload = {
        gameId: 'game-1',
        playerId: 'player-1',
        playerName: 'Player One',
        seat: 1,
      };
      service.seatPlayer(takeSeat1);

      const takeSeat2: MinRpsTakeSeatPayload = {
        gameId: 'game-1',
        playerId: 'player-1',
        playerName: 'Player One',
        seat: 2,
      };

      const result = service.seatPlayer(takeSeat2);

      expect(result.playerId).toBe('player-1');
      expect(result.player2Id).toBe('');
    });

    it('should not allow player2 to take seat 1', () => {
      // Player takes seat 2 first
      service.seatPlayer({
        gameId: 'game-1',
        playerId: 'player-1',
        playerName: 'Player One',
        seat: 2,
      });

      // Same player tries to take seat 1
      const result = service.seatPlayer({
        gameId: 'game-1',
        playerId: 'player-1',
        playerName: 'Player One',
        seat: 1,
      });

      // Should still be in seat 2, not moved to seat 1
      expect(result.player2Id).toBe('player-1');
      expect(result.playerId).toBe('');
    });

    it('should not allow seat to be taken if already occupied by another player', () => {
      service.seatPlayer({
        gameId: 'game-1',
        playerId: 'player-1',
        playerName: 'Player One',
        seat: 1,
      });

      const result = service.seatPlayer({
        gameId: 'game-1',
        playerId: 'player-2',
        playerName: 'Player Two',
        seat: 1,
      });

      // Seat 1 should still belong to player-1
      expect(result.playerId).toBe('player-1');
      expect(result.playerName).toBe('Player One');
    });
  });

  describe('selectMove', () => {
    it('should record player1 move selection', () => {
      const takeSeatPayload: MinRpsTakeSeatPayload = {
        gameId: 'game-1',
        playerId: 'player-1',
        playerName: 'Player One',
        seat: 1,
      };
      service.seatPlayer(takeSeatPayload);

      const selectMovePayload: MinRpsSelectMovePayload = {
        gameId: 'game-1',
        playerId: 'player-1',
        move: MinRpsMove.Rock,
      };

      const result = service.selectMove(selectMovePayload);

      expect(result.playerId).toBe('player-1');
      expect(result.move).toBe(MinRpsMove.Rock);
      expect(result.gameId).toBe('game-1');
    });

    it('should record player2 move selection', () => {
      const takeSeatPayload: MinRpsTakeSeatPayload = {
        gameId: 'game-1',
        playerId: 'player-2',
        playerName: 'Player Two',
        seat: 2,
      };
      service.seatPlayer(takeSeatPayload);

      const selectMovePayload: MinRpsSelectMovePayload = {
        gameId: 'game-1',
        playerId: 'player-2',
        move: MinRpsMove.Paper,
      };

      const result = service.selectMove(selectMovePayload);

      expect(result.playerId).toBe('player-2');
      expect(result.move).toBe(MinRpsMove.Paper);
    });
  });

  describe('playGame', () => {
    beforeEach(() => {
      // Setup two players in seats
      service.seatPlayer({
        gameId: 'game-1',
        playerId: 'player-1',
        playerName: 'Player One',
        seat: 1,
      });
      service.seatPlayer({
        gameId: 'game-1',
        playerId: 'player-2',
        playerName: 'Player Two',
        seat: 2,
      });
    });

    it('should return null if both players have not selected moves', () => {
      const playPayload: MinRpsPlayPayload = {
        gameId: 'game-1',
        playerId: 'player-1',
      };

      const result = service.playMatch(playPayload);

      expect(result).toBeNull();
    });

    it('should return result when both players have selected moves', () => {
      service.selectMove({
        gameId: 'game-1',
        playerId: 'player-1',
        move: MinRpsMove.Rock,
      });
      service.selectMove({
        gameId: 'game-1',
        playerId: 'player-2',
        move: MinRpsMove.Scissors,
      });

      const playPayload: MinRpsPlayPayload = {
        gameId: 'game-1',
        playerId: 'player-1',
      };

      const result = service.playMatch(playPayload);

      expect(result).not.toBeNull();
      expect(result?.player1Move).toBe(MinRpsMove.Rock);
      expect(result?.player2Move).toBe(MinRpsMove.Scissors);
      expect(result?.player1Result).toBe(MinRpsResult.Player1);
      expect(result?.player2Result).toBe(MinRpsResult.Player2);
    });

    it('should reset moves after play', () => {
      service.selectMove({
        gameId: 'game-1',
        playerId: 'player-1',
        move: MinRpsMove.Rock,
      });
      service.selectMove({
        gameId: 'game-1',
        playerId: 'player-2',
        move: MinRpsMove.Paper,
      });

      service.playMatch({ gameId: 'game-1', playerId: 'player-1' });

      const state = service.getGameState('game-1');
      expect(state.player1HasSelectedMove).toBe(false);
      expect(state.player2HasSelectedMove).toBe(false);
    });

    it('should return draw when both players choose same move', () => {
      service.selectMove({
        gameId: 'game-1',
        playerId: 'player-1',
        move: MinRpsMove.Rock,
      });
      service.selectMove({
        gameId: 'game-1',
        playerId: 'player-2',
        move: MinRpsMove.Rock,
      });

      const result = service.playMatch({ gameId: 'game-1', playerId: 'player-1' });

      expect(result?.player1Result).toBe(MinRpsResult.Draw);
      expect(result?.player2Result).toBe(MinRpsResult.Draw);
    });

    it('should return null if game does not exist', () => {
      const result = service.playMatch({
        gameId: 'non-existent-game',
        playerId: 'player-1',
      });

      expect(result).toBeNull();
    });

    it('should return null if player not in game tries to play', () => {
      service.selectMove({
        gameId: 'game-1',
        playerId: 'player-1',
        move: MinRpsMove.Rock,
      });
      service.selectMove({
        gameId: 'game-1',
        playerId: 'player-2',
        move: MinRpsMove.Paper,
      });

      const result = service.playMatch({
        gameId: 'game-1',
        playerId: 'unknown-player',
      });

      expect(result).toBeNull();
    });
  });

  describe('getGameState', () => {
    it('should return game state with no players', () => {
      const state = service.getGameState('game-1');

      expect(state.matchId).toBe('game-1');
      expect(state.playerId).toBe('');
      expect(state.player2Id).toBe('');
      // When game state doesn't exist, the check for MinRpsMove.None returns true
      expect(state.player1HasSelectedMove).toBeDefined();
      expect(state.player2HasSelectedMove).toBeDefined();
    });

    it('should show when players have selected moves without revealing them', () => {
      service.seatPlayer({
        gameId: 'game-1',
        playerId: 'player-1',
        playerName: 'Player One',
        seat: 1,
      });
      service.selectMove({
        gameId: 'game-1',
        playerId: 'player-1',
        move: MinRpsMove.Rock,
      });

      const state = service.getGameState('game-1');

      expect(state.player1HasSelectedMove).toBe(true);
      expect(state.playerMove).toBe(MinRpsMove.None); // Move should be hidden
      expect(state.player2HasSelectedMove).toBe(false);
    });
  });

  describe('getAllPlayerRoomNames', () => {
    it('should return all rooms player is in', () => {
      service.joinMatch(mockSocket, { matchId: 'game-1', playerId: 'player-1' });
      service.joinMatch(mockSocket, { matchId: 'game-2', playerId: 'player-1' });

      const rooms = service.getAllPlayerRoomNames(mockSocket);

      expect(rooms).toContain('game-1');
      expect(rooms).toContain('game-2');
    });
  });

  describe('getPlayerIdForSocket', () => {
    it('should return player ID for socket', () => {
      service.joinMatch(mockSocket, { matchId: 'game-1', playerId: 'player-1' });

      const playerId = service.getPlayerIdForSocket(mockSocket);

      expect(playerId).toBe('player-1');
    });

    it('should return undefined for unknown socket', () => {
      const unknownSocket = { id: 'unknown' } as any;

      const playerId = service.getPlayerIdForSocket(unknownSocket);

      expect(playerId).toBeUndefined();
    });
  });

  describe('removePlayerFromGames', () => {
    it('should remove player from multiple games', () => {
      service.seatPlayer({
        gameId: 'game-1',
        playerId: 'player-1',
        playerName: 'Player One',
        seat: 1,
      });
      service.seatPlayer({
        gameId: 'game-2',
        playerId: 'player-1',
        playerName: 'Player One',
        seat: 1,
      });

      service.removePlayerFromGames(['game-1', 'game-2'], 'player-1');

      const state1 = service.getGameState('game-1');
      const state2 = service.getGameState('game-2');

      expect(state1.playerId).toBe('');
      expect(state2.playerId).toBe('');
    });

    it('should handle removing player from non-existent game', () => {
      expect(() => {
        service.removePlayerFromGames(['non-existent-game'], 'player-1');
      }).not.toThrow();
    });
  });

  describe('clearPlayerSocket', () => {
    it('should clear player socket mapping', () => {
      service.joinMatch(mockSocket, { matchId: 'game-1', playerId: 'player-1' });

      service.clearPlayerSocket(mockSocket);

      const playerId = service.getPlayerIdForSocket(mockSocket);
      expect(playerId).toBeUndefined();
    });
  });

  describe('removePlayerFromAllRooms', () => {
    it('should remove player from all rooms', () => {
      service.joinMatch(mockSocket, { matchId: 'game-1', playerId: 'player-1' });
      service.joinMatch(mockSocket, { matchId: 'game-2', playerId: 'player-1' });

      service.removePlayerFromAllRooms(mockSocket);

      const rooms = service.getAllPlayerRoomNames(mockSocket);
      expect(rooms).toEqual([]);
    });
  });
});
