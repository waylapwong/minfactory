import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { MINPOKER_SERVER_MOCK, MINPOKER_SERVER_TO_EMIT_MOCK } from '../mocks/minpoker-server.mock';
import { MINPOKER_SOCKET_MOCK } from '../mocks/minpoker-socket.mock';
import { MINPOKER_TOURNAMENT_SERVICE_MOCK } from '../mocks/minpoker-tournament.service.mock';
import { MinPokerJoinCommand } from '../models/commands/minpoker-join.command';
import { MinPokerSeatCommand } from '../models/commands/minpoker-seat.command';
import { MinPokerEvent } from '../models/enums/minpoker-event.enum';
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
        matchId: 'match-1',
      });

      await gateway.handleSeatCommand(command);

      expect(MINPOKER_TOURNAMENT_SERVICE_MOCK.seatPlayer).toHaveBeenCalledWith(command);
      expect(mockServer.to).toHaveBeenCalledWith('match-1');
      expect(MINPOKER_SERVER_TO_EMIT_MOCK).toHaveBeenCalledWith(MinPokerEvent.Updated, { matchId: 'match-1' });
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
