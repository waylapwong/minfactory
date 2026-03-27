import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { MINPOKER_SERVER_MOCK } from '../mocks/minpoker-server.mock';
import { MINPOKER_SOCKET_MOCK } from '../mocks/minpoker-socket.mock';
import { MINPOKER_TOURNAMENT_SERVICE_MOCK } from '../mocks/minpoker-tournament.service.mock';
import { MinPokerConnectCommand } from '../models/commands/minpoker-connect.command';
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

  describe('handleConnectCommand', () => {
    it('should handle connect command and emit connected event', () => {
      const command: MinPokerConnectCommand = {
        playerId: 'user-1',
      };
      MINPOKER_TOURNAMENT_SERVICE_MOCK.handleConnection.mockReturnValue({
        playerId: 'user-1',
      });

      gateway.handleConnectCommand(mockSocket, command);

      expect(MINPOKER_TOURNAMENT_SERVICE_MOCK.handleConnection).toHaveBeenCalledWith('user-1');
      expect(mockSocket.emit).toHaveBeenCalledWith(MinPokerEvent.MatchConnected, { playerId: 'user-1' });
      expect(mockSocket.data.playerId).toBe('user-1');
    });
  });

  describe('handleDisconnect', () => {
    it('should emit disconnected event for socket with known playerId', () => {
      mockSocket.data.playerId = 'user-1';
      MINPOKER_TOURNAMENT_SERVICE_MOCK.handleDisconnect.mockReturnValue({
        playerId: 'user-1',
      });

      gateway.handleDisconnect(mockSocket);

      expect(MINPOKER_TOURNAMENT_SERVICE_MOCK.handleDisconnect).toHaveBeenCalledWith('user-1');
      expect(mockServer.emit).toHaveBeenCalledWith(MinPokerEvent.MatchDisconnected, { playerId: 'user-1' });
    });

    it('should skip disconnect handling when socket has no playerId', () => {
      gateway.handleDisconnect(mockSocket);

      expect(MINPOKER_TOURNAMENT_SERVICE_MOCK.handleDisconnect).not.toHaveBeenCalled();
      expect(mockServer.emit).not.toHaveBeenCalled();
    });
  });
});
