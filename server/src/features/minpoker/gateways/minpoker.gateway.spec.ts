import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { MINPOKER_PLAYER_ID_REPOSITORY_MOCK } from '../mocks/minpoker-player-id.repository.mock';
import { MINPOKER_SERVER_MOCK, MINPOKER_SERVER_TO_EMIT_MOCK } from '../mocks/minpoker-server.mock';
import { MINPOKER_SOCKET_MOCK } from '../mocks/minpoker-socket.mock';
import { MINPOKER_TOURNAMENT_SERVICE_MOCK } from '../mocks/minpoker-tournament.service.mock';
import { MinPokerJoinCommand } from '../models/commands/minpoker-join.command';
import { MinPokerLeaveCommand } from '../models/commands/minpoker-leave.command';
import { MinPokerSeatCommand } from '../models/commands/minpoker-seat.command';
import { MinPokerEvent } from '../models/enums/minpoker-event.enum';
import { MinPokerPlayerIdRepository } from '../repositories/minpoker-player-id.repository';
import { MinPokerTournamentService } from '../services/minpoker-tournament.service';
import { MinPokerGateway } from './minpoker.gateway';

describe('MinpokerGateway', () => {
  let gateway: MinPokerGateway;
  let mockSocket: jest.Mocked<Socket>;
  let mockServer: jest.Mocked<Server>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinPokerGateway,
        {
          provide: MinPokerTournamentService,
          useValue: MINPOKER_TOURNAMENT_SERVICE_MOCK,
        },
        {
          provide: MinPokerPlayerIdRepository,
          useValue: MINPOKER_PLAYER_ID_REPOSITORY_MOCK,
        },
      ],
    }).compile();

    gateway = module.get<MinPokerGateway>(MinPokerGateway);
    mockSocket = MINPOKER_SOCKET_MOCK as any;
    mockServer = MINPOKER_SERVER_MOCK as any;

    mockSocket.data = {};

    gateway.server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should emit connected event for connected socket', () => {
      MINPOKER_TOURNAMENT_SERVICE_MOCK.handleConnection.mockReturnValue({
        playerId: 'user-1',
      });

      gateway.handleConnection(mockSocket);

      expect(MINPOKER_TOURNAMENT_SERVICE_MOCK.handleConnection).toHaveBeenCalledWith(mockSocket);
      expect(mockSocket.emit).toHaveBeenCalledWith(MinPokerEvent.MatchConnected, { playerId: 'user-1' });
    });
  });

  describe('handleJoinCommand', () => {
    it('should handle join command and broadcast updated event to room', async () => {
      const command: MinPokerJoinCommand = { matchId: 'match-1', playerId: 'user-1' };
      MINPOKER_TOURNAMENT_SERVICE_MOCK.joinMatch.mockResolvedValue({
        matchId: 'match-1',
      });

      await gateway.handleJoinCommand(mockSocket, command);

      expect(MINPOKER_TOURNAMENT_SERVICE_MOCK.joinMatch).toHaveBeenCalledWith(mockSocket, command);
      expect(mockServer.to).toHaveBeenCalledWith('match-1');
      expect(MINPOKER_SERVER_TO_EMIT_MOCK).toHaveBeenCalledWith(MinPokerEvent.Updated, { matchId: 'match-1' });
    });
  });

  describe('handleLeaveCommand', () => {
    it('should handle leave command and broadcast updated event to room', () => {
      const command: MinPokerLeaveCommand = { matchId: 'match-1', playerId: 'user-1' };
      MINPOKER_TOURNAMENT_SERVICE_MOCK.leaveMatch.mockReturnValue({ matchId: 'match-1' });

      gateway.handleLeaveCommand(mockSocket, command);

      expect(MINPOKER_TOURNAMENT_SERVICE_MOCK.leaveMatch).toHaveBeenCalledWith(mockSocket, command);
      expect(mockServer.to).toHaveBeenCalledWith('match-1');
      expect(MINPOKER_SERVER_TO_EMIT_MOCK).toHaveBeenCalledWith(MinPokerEvent.Updated, { matchId: 'match-1' });
    });

    it('should not broadcast when match was deleted after last participant left', () => {
      const command: MinPokerLeaveCommand = { matchId: 'match-1', playerId: 'user-1' };
      MINPOKER_TOURNAMENT_SERVICE_MOCK.leaveMatch.mockReturnValue(null);

      gateway.handleLeaveCommand(mockSocket, command);

      expect(MINPOKER_TOURNAMENT_SERVICE_MOCK.leaveMatch).toHaveBeenCalledWith(mockSocket, command);
      expect(mockServer.to).not.toHaveBeenCalled();
      expect(MINPOKER_SERVER_TO_EMIT_MOCK).not.toHaveBeenCalled();
    });
  });

  describe('handleSeatCommand', () => {
    it('should handle seat command and broadcast updated event to room', async () => {
      const command: MinPokerSeatCommand = {
        avatar: 'woman-1.svg',
        matchId: 'match-1',
        playerId: 'user-1',
        playerName: 'Alice',
        seat: 2,
      };
      MINPOKER_TOURNAMENT_SERVICE_MOCK.seatPlayer.mockResolvedValue({
        updatedEvent: { matchId: 'match-1' },
        hands: null,
      });

      await gateway.handleSeatCommand(mockSocket, command);

      expect(MINPOKER_TOURNAMENT_SERVICE_MOCK.seatPlayer).toHaveBeenCalledWith(mockSocket, command);
      expect(mockServer.to).toHaveBeenCalledWith('match-1');
      expect(MINPOKER_SERVER_TO_EMIT_MOCK).toHaveBeenCalledWith(MinPokerEvent.Updated, { matchId: 'match-1' });
    });

    it('should send HandDealt events to each player when a round starts', async () => {
      const command: MinPokerSeatCommand = {
        avatar: 'woman-1.svg',
        matchId: 'match-1',
        playerId: 'user-1',
        playerName: 'Alice',
        seat: 0,
      };
      const hands: Map<string, { hand: string[] }> = new Map([
        ['player-1', { hand: ['Ah', 'Ks'] }],
        ['player-2', { hand: ['2d', '9c'] }],
      ]);
      MINPOKER_TOURNAMENT_SERVICE_MOCK.seatPlayer.mockResolvedValue({
        updatedEvent: { matchId: 'match-1' },
        hands,
      });
      MINPOKER_PLAYER_ID_REPOSITORY_MOCK.findByPlayerId
        .mockReturnValueOnce('socket-1')
        .mockReturnValueOnce('socket-2');

      await gateway.handleSeatCommand(mockSocket, command);

      expect(mockServer.to).toHaveBeenCalledWith('socket-1');
      expect(mockServer.to).toHaveBeenCalledWith('socket-2');
      expect(MINPOKER_SERVER_TO_EMIT_MOCK).toHaveBeenCalledWith(MinPokerEvent.HandDealt, { hand: ['Ah', 'Ks'] });
      expect(MINPOKER_SERVER_TO_EMIT_MOCK).toHaveBeenCalledWith(MinPokerEvent.HandDealt, { hand: ['2d', '9c'] });
    });

    it('should not send HandDealt events when no round starts', async () => {
      const command: MinPokerSeatCommand = {
        avatar: 'woman-1.svg',
        matchId: 'match-1',
        playerId: 'user-1',
        playerName: 'Alice',
        seat: 0,
      };
      MINPOKER_TOURNAMENT_SERVICE_MOCK.seatPlayer.mockResolvedValue({
        updatedEvent: { matchId: 'match-1' },
        hands: null,
      });

      await gateway.handleSeatCommand(mockSocket, command);

      expect(MINPOKER_PLAYER_ID_REPOSITORY_MOCK.findByPlayerId).not.toHaveBeenCalled();
      expect(MINPOKER_SERVER_TO_EMIT_MOCK).toHaveBeenCalledWith(MinPokerEvent.Updated, { matchId: 'match-1' });
      expect(MINPOKER_SERVER_TO_EMIT_MOCK).not.toHaveBeenCalledWith(MinPokerEvent.HandDealt, expect.anything());
    });
  });

  describe('handleDisconnect', () => {
    it('should emit disconnected and updated events for socket with active match', () => {
      MINPOKER_TOURNAMENT_SERVICE_MOCK.handleDisconnect.mockReturnValue({
        disconnectedEvent: { matchId: 'match-1', playerId: 'user-1' },
        updatedEvent: { matchId: 'match-1' },
      });

      gateway.handleDisconnect(mockSocket);

      expect(MINPOKER_TOURNAMENT_SERVICE_MOCK.handleDisconnect).toHaveBeenCalledWith(mockSocket);
      expect(mockServer.to).toHaveBeenCalledWith('match-1');
      expect(MINPOKER_SERVER_TO_EMIT_MOCK).toHaveBeenCalledWith(MinPokerEvent.MatchDisconnected, {
        matchId: 'match-1',
        playerId: 'user-1',
      });
      expect(MINPOKER_SERVER_TO_EMIT_MOCK).toHaveBeenCalledWith(MinPokerEvent.Updated, { matchId: 'match-1' });
    });

    it('should skip disconnect handling when service returns no result', () => {
      MINPOKER_TOURNAMENT_SERVICE_MOCK.handleDisconnect.mockReturnValue(null);

      gateway.handleDisconnect(mockSocket);

      expect(MINPOKER_TOURNAMENT_SERVICE_MOCK.handleDisconnect).toHaveBeenCalledWith(mockSocket);
      expect(mockServer.emit).not.toHaveBeenCalled();
      expect(MINPOKER_SERVER_TO_EMIT_MOCK).not.toHaveBeenCalled();
    });
  });
});
