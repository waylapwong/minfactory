import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { MinRpsMove } from '../models/enums/minrps-move.enum';
import { MinRpsMatchJoinPayload } from '../models/payloads/minrps-match-join.payload';
import { MinRpsMatchLeavePayload } from '../models/payloads/minrps-match-leave.payload';
import { MinRpsMatchPlayPayload } from '../models/payloads/minrps-match-play.payload';
import { MinRpsMatchSeatPayload } from '../models/payloads/minrps-match-seat.payload';
import { MinRpsMultiplayerService } from '../services/minrps-multiplayer.service';
import { MINRPS_MULTIPLAYER_SERVICE_MOCK } from '../mocks/minrps-multiplayer.service.mock';
import { MinRpsGateway } from './minrps.gateway';

describe('MinRpsGateway', () => {
  let gateway: MinRpsGateway;
  let mockSocket: jest.Mocked<Socket>;
  let mockServer: jest.Mocked<Server>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinRpsGateway,
        {
          provide: MinRpsMultiplayerService,
          useValue: MINRPS_MULTIPLAYER_SERVICE_MOCK,
        },
      ],
    }).compile();

    gateway = module.get<MinRpsGateway>(MinRpsGateway);

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should send Connected event with playerId', () => {
      const playerId = 'test-player-id';
      MINRPS_MULTIPLAYER_SERVICE_MOCK.handleConnection.mockReturnValue({
        playerId,
      } as any);

      gateway.handleConnection(mockSocket);

      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.handleConnection).toHaveBeenCalledWith(mockSocket);
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
      MINRPS_MULTIPLAYER_SERVICE_MOCK.joinMatch.mockReturnValue(mockEvent as any);

      gateway.handleJoinCommand(mockSocket, joinPayload);

      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.joinMatch).toHaveBeenCalledWith(mockSocket, joinPayload);
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
      MINRPS_MULTIPLAYER_SERVICE_MOCK.leaveMatch.mockReturnValue(mockEvent as any);

      gateway.handleLeaveCommand(mockSocket, leavePayload);

      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.leaveMatch).toHaveBeenCalledWith(mockSocket, leavePayload);
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
      MINRPS_MULTIPLAYER_SERVICE_MOCK.playMatch.mockReturnValue(mockEvent as any);

      const mockOpponentEmit = jest.fn();
      const mockExcept = jest.fn().mockReturnValue({ emit: mockOpponentEmit });
      mockServer.to = jest.fn().mockReturnValue({ except: mockExcept, emit: jest.fn() });

      gateway.handlePlayCommand(mockSocket, playPayload);

      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.playMatch).toHaveBeenCalledWith(playPayload);
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
      MINRPS_MULTIPLAYER_SERVICE_MOCK.playMatch.mockReturnValue(mockEvent as any);
      MINRPS_MULTIPLAYER_SERVICE_MOCK.resetMatch.mockReturnValue(resetEvent as any);

      gateway.handlePlayCommand(mockSocket, playPayload);

      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.playMatch).toHaveBeenCalledWith(playPayload);
      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.resetMatch).not.toHaveBeenCalled();
      expect(mockServer.to).toHaveBeenCalledTimes(1);
      expect(mockServer.to).toHaveBeenCalledWith('match-1');

      jest.advanceTimersByTime(3000);

      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.resetMatch).toHaveBeenCalledWith('match-1');
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
        seat: 1,
      };
      const mockEvent = { matchId: 'match-1' };
      MINRPS_MULTIPLAYER_SERVICE_MOCK.seatPlayer.mockReturnValue(mockEvent as any);

      gateway.handleSeatCommand(seatPayload);

      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.seatPlayer).toHaveBeenCalledWith(seatPayload);
      expect(mockServer.to).toHaveBeenCalledWith('match-1');
    });
  });

  describe('handleDisconnect', () => {
    it('should handle disconnect and broadcast if player was in a match', () => {
      const mockEvent = { matchId: 'match-1' };
      MINRPS_MULTIPLAYER_SERVICE_MOCK.handleDisconnect.mockReturnValue(mockEvent as any);

      gateway.handleDisconnect(mockSocket);

      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.handleDisconnect).toHaveBeenCalledWith(mockSocket);
      expect(mockServer.to).toHaveBeenCalledWith('match-1');
    });

    it('should handle disconnect with no active match', () => {
      MINRPS_MULTIPLAYER_SERVICE_MOCK.handleDisconnect.mockReturnValue(null);

      gateway.handleDisconnect(mockSocket);

      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.handleDisconnect).toHaveBeenCalledWith(mockSocket);
      expect(mockServer.to).not.toHaveBeenCalled();
    });
  });
});
