import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { AUTHENTICATION_SERVICE_MOCK } from 'src/core/mocks/authentication.service.mock';
import { AuthenticationService } from 'src/core/authentication/services/authentication.service';
import { MINPOKER_SERVER_MOCK } from '../mocks/minpoker-server.mock';
import { MINPOKER_SOCKET_MOCK } from '../mocks/minpoker-socket.mock';
import { MINPOKER_TOURNAMENT_SERVICE_MOCK } from '../mocks/minpoker-tournament.service.mock';
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
        {
          provide: AuthenticationService,
          useValue: AUTHENTICATION_SERVICE_MOCK,
        },
      ],
    }).compile();

    gateway = module.get<MinPokerGateway>(MinPokerGateway);
    mockSocket = MINPOKER_SOCKET_MOCK as any;
    mockServer = MINPOKER_SERVER_MOCK as any;

    mockSocket.data = {};
    mockSocket.handshake.auth = {};
    mockSocket.handshake.headers.authorization = 'Bearer valid-token';

    gateway.server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should authenticate socket and emit connected event', async () => {
      AUTHENTICATION_SERVICE_MOCK.verifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-1',
        email: 'user@test.local',
      });
      MINPOKER_TOURNAMENT_SERVICE_MOCK.handleConnection.mockResolvedValue({
        playerId: 'user-1',
      });

      await gateway.handleConnection(mockSocket);

      expect(AUTHENTICATION_SERVICE_MOCK.verifyIdToken).toHaveBeenCalledWith('valid-token');
      expect(MINPOKER_TOURNAMENT_SERVICE_MOCK.handleConnection).toHaveBeenCalledWith('firebase-uid-1');
      expect(mockSocket.emit).toHaveBeenCalledWith(MinPokerEvent.MatchConnected, { playerId: 'user-1' });
      expect(mockSocket.disconnect).not.toHaveBeenCalled();
      expect(mockSocket.data.firebaseUser).toEqual({
        firebaseUid: 'firebase-uid-1',
        email: 'user@test.local',
      });
    });

    it('should disconnect socket when authentication fails', async () => {
      AUTHENTICATION_SERVICE_MOCK.verifyIdToken.mockRejectedValue(new Error('invalid token'));

      await gateway.handleConnection(mockSocket);

      expect(MINPOKER_TOURNAMENT_SERVICE_MOCK.handleConnection).not.toHaveBeenCalled();
      expect(mockSocket.emit).not.toHaveBeenCalled();
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
    });
  });

  describe('handleDisconnect', () => {
    it('should emit disconnected event for authenticated user', async () => {
      mockSocket.data.firebaseUser = {
        firebaseUid: 'firebase-uid-1',
        email: 'user@test.local',
      };
      MINPOKER_TOURNAMENT_SERVICE_MOCK.handleDisconnect.mockResolvedValue({
        playerId: 'user-1',
      });

      await gateway.handleDisconnect(mockSocket);

      expect(MINPOKER_TOURNAMENT_SERVICE_MOCK.handleDisconnect).toHaveBeenCalledWith('firebase-uid-1');
      expect(mockServer.emit).toHaveBeenCalledWith(MinPokerEvent.MatchDisconnected, { playerId: 'user-1' });
    });

    it('should skip disconnect handling when socket has no authenticated user', async () => {
      await gateway.handleDisconnect(mockSocket);

      expect(MINPOKER_TOURNAMENT_SERVICE_MOCK.handleDisconnect).not.toHaveBeenCalled();
      expect(mockServer.emit).not.toHaveBeenCalled();
    });
  });
});
