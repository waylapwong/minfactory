import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { MinRpsMove } from '../models/enums/minrps-move.enum';
import { MinRpsMatchJoinPayload } from '../models/payloads/minrps-match-join.payload';
import { MinRpsMatchLeavePayload } from '../models/payloads/minrps-match-leave.payload';
import { MinRpsMatchPlayPayload } from '../models/payloads/minrps-match-play.payload';
import { MinRpsMatchSeatPayload } from '../models/payloads/minrps-match-seat.payload';
import { MinRpsMultiplayerService } from '../services/minrps-multiplayer.service';
import { MinRpsGateway } from './minrps.gateway';

describe('MinRpsGateway', () => {
  let gateway: MinRpsGateway;
  let multiplayerService: jest.Mocked<MinRpsMultiplayerService>;
  let mockSocket: jest.Mocked<Socket>;
  let mockServer: jest.Mocked<Server>;

  beforeEach(async () => {
    const mockMultiplayerService = {
      handleConnection: jest.fn(),
      handleDisconnect: jest.fn(),
      joinMatch: jest.fn(),
      leaveMatch: jest.fn(),
      seatPlayer: jest.fn(),
      playMatch: jest.fn(),
      resetMatch: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinRpsGateway,
        {
          provide: MinRpsMultiplayerService,
          useValue: mockMultiplayerService,
        },
      ],
    }).compile();

    gateway = module.get<MinRpsGateway>(MinRpsGateway);
    multiplayerService = module.get(MinRpsMultiplayerService);

    mockSocket = {
      id: 'test-socket',
      emit: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
    } as any;

    mockServer = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
        except: jest.fn().mockReturnValue({ emit: jest.fn() }),
      }),
    } as any;

    gateway.server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should send Connected event with playerId', () => {
      const playerId = 'test-player-id';
      multiplayerService.handleConnection.mockReturnValue({
        playerId,
      } as any);

      gateway.handleConnection(mockSocket);

      expect(multiplayerService.handleConnection).toHaveBeenCalledWith(mockSocket);
      expect(mockSocket.emit).toHaveBeenCalled();
    });
  });

  describe('handleJoinCommand', () => {
    it('should handle join command and broadcast match updated event', () => {
      const joinPayload: MinRpsMatchJoinPayload = {
        matchId: 'match-1',
        playerId: 'player-1',
      };
      const mockEvent = { matchId: 'match-1' };
      multiplayerService.joinMatch.mockReturnValue(mockEvent as any);

      gateway.handleJoinCommand(mockSocket, joinPayload);

      expect(multiplayerService.joinMatch).toHaveBeenCalledWith(mockSocket, joinPayload);
      expect(mockServer.to).toHaveBeenCalledWith('match-1');
    });
  });

  describe('handleLeaveCommand', () => {
    it('should handle leave command and broadcast match updated event', () => {
      const leavePayload: MinRpsMatchLeavePayload = {
        matchId: 'match-1',
        playerId: 'player-1',
      };
      const mockEvent = { matchId: 'match-1' };
      multiplayerService.leaveMatch.mockReturnValue(mockEvent as any);

      gateway.handleLeaveCommand(mockSocket, leavePayload);

      expect(multiplayerService.leaveMatch).toHaveBeenCalledWith(mockSocket, leavePayload);
      expect(mockServer.to).toHaveBeenCalledWith('match-1');
    });
  });

  describe('handlePlayCommand', () => {
    it('should handle play command when only one player has played', () => {
      const playPayload: MinRpsMatchPlayPayload = {
        matchId: 'match-1',
        playerId: 'player-1',
        playerMove: MinRpsMove.Rock,
      };
      const mockEvent = {
        matchId: 'match-1',
        observers: [],
        player1HasSelectedMove: true,
        player1Id: 'player-1',
        player1Move: MinRpsMove.Rock,
        player1Name: 'Alice',
        player2HasSelectedMove: false,
        player2Id: 'player-2',
        player2Move: MinRpsMove.None,
        player2Name: 'Bob',
        result: 'None',
      };
      multiplayerService.playMatch.mockReturnValue(mockEvent as any);

      const mockOpponentEmit = jest.fn();
      const mockExcept = jest.fn().mockReturnValue({ emit: mockOpponentEmit });
      mockServer.to = jest.fn().mockReturnValue({ except: mockExcept, emit: jest.fn() });

      gateway.handlePlayCommand(mockSocket, playPayload);

      expect(multiplayerService.playMatch).toHaveBeenCalledWith(playPayload);
      // Playing client receives the event with their own move visible
      expect(mockSocket.emit).toHaveBeenCalled();
      // Opponent notification goes to the room, excluding the playing client
      expect(mockServer.to).toHaveBeenCalledWith('match-1');
      expect(mockExcept).toHaveBeenCalledWith('test-socket');
      // Opponent notification: player1's move is hidden (masked to None), hasSelectedMove stays true
      expect(mockOpponentEmit).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          matchId: 'match-1',
          player1HasSelectedMove: true,
          player1Move: MinRpsMove.None,
          player2HasSelectedMove: false,
          player2Move: MinRpsMove.None,
        }),
      );
    });

    it('should handle play command when both players have played', () => {
      jest.useFakeTimers();

      const playPayload: MinRpsMatchPlayPayload = {
        matchId: 'match-1',
        playerId: 'player-1',
        playerMove: MinRpsMove.Rock,
      };
      const mockEvent = {
        matchId: 'match-1',
        player1Move: MinRpsMove.Rock,
        player2Move: MinRpsMove.Paper,
      };
      const resetEvent = {
        matchId: 'match-1',
        player1Move: MinRpsMove.None,
        player2Move: MinRpsMove.None,
      };
      multiplayerService.playMatch.mockReturnValue(mockEvent as any);
      multiplayerService.resetMatch.mockReturnValue(resetEvent as any);

      gateway.handlePlayCommand(mockSocket, playPayload);

      expect(multiplayerService.playMatch).toHaveBeenCalledWith(playPayload);
      expect(multiplayerService.resetMatch).not.toHaveBeenCalled();
      expect(mockServer.to).toHaveBeenCalledTimes(1);
      expect(mockServer.to).toHaveBeenCalledWith('match-1');

      jest.advanceTimersByTime(3000);

      expect(multiplayerService.resetMatch).toHaveBeenCalledWith('match-1');
      expect(mockServer.to).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });
  });

  describe('handleSeatCommand', () => {
    it('should handle seat command and broadcast match updated event', () => {
      const seatPayload: MinRpsMatchSeatPayload = {
        matchId: 'match-1',
        playerId: 'player-1',
        playerName: 'Alice',
      };
      const mockEvent = { matchId: 'match-1' };
      multiplayerService.seatPlayer.mockReturnValue(mockEvent as any);

      gateway.handleSeatCommand(seatPayload);

      expect(multiplayerService.seatPlayer).toHaveBeenCalledWith(seatPayload);
      expect(mockServer.to).toHaveBeenCalledWith('match-1');
    });
  });

  describe('handleDisconnect', () => {
    it('should handle disconnect and broadcast if player was in a match', () => {
      const mockEvent = { matchId: 'match-1' };
      multiplayerService.handleDisconnect.mockReturnValue(mockEvent as any);

      gateway.handleDisconnect(mockSocket);

      expect(multiplayerService.handleDisconnect).toHaveBeenCalledWith(mockSocket);
      expect(mockServer.to).toHaveBeenCalledWith('match-1');
    });

    it('should handle disconnect with no active match', () => {
      multiplayerService.handleDisconnect.mockReturnValue(null);

      gateway.handleDisconnect(mockSocket);

      expect(multiplayerService.handleDisconnect).toHaveBeenCalledWith(mockSocket);
      expect(mockServer.to).not.toHaveBeenCalled();
    });
  });
});
