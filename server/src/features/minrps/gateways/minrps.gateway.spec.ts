import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsGateway } from './minrps.gateway';
import { MinRpsMultiplayerService } from '../services/minrps-multiplayer.service';
import { Socket, Server } from 'socket.io';
import { MinRpsMatchJoinPayload } from '../models/payloads/minrps-match-join.payload';
import { MinRpsMatchLeavePayload } from '../models/payloads/minrps-match-leave.payload';
import { MinRpsTakeSeatPayload } from '../models/payloads/minrps-take-seat.payload';
import { MinRpsSelectMovePayload } from '../models/payloads/minrps-select-move.payload';
import { MinRpsPlayPayload } from '../models/payloads/minrps-play.payload';
import { MinRpsJoinedPayload } from '../models/payloads/minrps-joined.payload';
import { MinRpsLeftPayload } from '../models/payloads/minrps-left.payload';
import { MinRpsMatchPlayPayload } from '../models/payloads/minrps-match-play.payload';
import { MinRpsMoveSelectedPayload } from '../models/payloads/minrps-move-selected.payload';
import { MinRpsPlayedPayload } from '../models/payloads/minrps-played.payload';
import { MinRpsMove } from '../models/enums/minrps-move.enum';
import { MinRpsResult } from '../models/enums/minrps-game-result.enum';
import { Acknowledgement } from 'src/shared/objects/acknowledgement';

describe('MinRpsGateway', () => {
  let gateway: MinRpsGateway;
  let multiplayerService: jest.Mocked<MinRpsMultiplayerService>;
  let mockSocket: jest.Mocked<Socket>;
  let mockServer: jest.Mocked<Server>;

  beforeEach(async () => {
    const mockMultiplayerService = {
      joinGame: jest.fn(),
      leaveGame: jest.fn(),
      takeSeat: jest.fn(),
      playGame: jest.fn(),
      selectMove: jest.fn(),
      getGameState: jest.fn(),
      getAllPlayerRoomNames: jest.fn(),
      getPlayerIdForSocket: jest.fn(),
      removePlayerFromAllRooms: jest.fn(),
      removePlayerFromGames: jest.fn(),
      clearPlayerSocket: jest.fn(),
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
      id: 'test-socket-id',
      emit: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
    } as any;

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;

    gateway.server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleJoinEvent', () => {
    it('should handle join event and emit joined payload', () => {
      const joinPayload: MinRpsMatchJoinPayload = {
        matchId: 'game-1',
        playerId: 'player-1',
      };

      const joinedPayload = new MinRpsJoinedPayload();
      joinedPayload.gameId = 'game-1';
      joinedPayload.playerId = 'player-1';

      const gameState = new MinRpsMatchPlayPayload();
      gameState.matchId = 'game-1';

      multiplayerService.joinMatch.mockReturnValue(joinedPayload);
      multiplayerService.getGameState.mockReturnValue(gameState);

      const result = gateway.handleJoinCommand(mockSocket, joinPayload);

      expect(result).toBeInstanceOf(Acknowledgement);
      expect(multiplayerService.joinMatch).toHaveBeenCalledWith(mockSocket, joinPayload);
      expect(multiplayerService.getGameState).toHaveBeenCalledWith('game-1');
      expect(mockServer.to).toHaveBeenCalledWith('game-1');
    });
  });

  describe('handleLeaveEvent', () => {
    it('should handle leave event and emit left payload', () => {
      const leavePayload: MinRpsMatchLeavePayload = {
        matchId: 'game-1',
        playerId: 'player-1',
      };

      const leftPayload = new MinRpsLeftPayload();
      leftPayload.gameId = 'game-1';
      leftPayload.playerId = 'player-1';

      const gameState = new MinRpsMatchPlayPayload();
      gameState.matchId = 'game-1';

      multiplayerService.leaveMatch.mockReturnValue(leftPayload);
      multiplayerService.getGameState.mockReturnValue(gameState);

      const result = gateway.handleLeaveCommand(mockSocket, leavePayload);

      expect(result).toBeInstanceOf(Acknowledgement);
      expect(multiplayerService.leaveMatch).toHaveBeenCalledWith(mockSocket, leavePayload);
      expect(multiplayerService.getGameState).toHaveBeenCalledWith('game-1');
    });
  });

  describe('handleTakeSeatEvent', () => {
    it('should handle take seat event and emit game state', () => {
      const takeSeatPayload: MinRpsTakeSeatPayload = {
        gameId: 'game-1',
        playerId: 'player-1',
        playerName: 'Player One',
        seat: 1,
      };

      const gameState = new MinRpsMatchPlayPayload();
      gameState.matchId = 'game-1';
      gameState.playerId = 'player-1';
      gameState.playerName = 'Player One';

      multiplayerService.sitMatch.mockReturnValue(gameState);

      const result = gateway.handleSitCommand(takeSeatPayload);

      expect(result).toBeInstanceOf(Acknowledgement);
      expect(multiplayerService.sitMatch).toHaveBeenCalledWith(takeSeatPayload);
      expect(mockServer.to).toHaveBeenCalledWith('game-1');
    });
  });

  describe('handlePlayEvent', () => {
    it('should handle play event when both players have selected moves', () => {
      const playPayload: MinRpsPlayPayload = {
        gameId: 'game-1',
        playerId: 'player-1',
      };

      const playedPayload = new MinRpsPlayedPayload();
      playedPayload.gameId = 'game-1';
      playedPayload.player1Move = MinRpsMove.Rock;
      playedPayload.player2Move = MinRpsMove.Scissors;
      playedPayload.player1Result = MinRpsResult.Player1;
      playedPayload.player2Result = MinRpsResult.Player2;

      const gameState = new MinRpsMatchPlayPayload();
      gameState.matchId = 'game-1';

      multiplayerService.playMatch.mockReturnValue(playedPayload);
      multiplayerService.getGameState.mockReturnValue(gameState);

      const result = gateway.handlePlayCommand(mockSocket, playPayload);

      expect(result).toBeInstanceOf(Acknowledgement);
      expect(multiplayerService.playMatch).toHaveBeenCalledWith(playPayload);
      expect(multiplayerService.getGameState).toHaveBeenCalledWith('game-1');
    });

    it('should handle play event when not all players have selected moves', () => {
      const playPayload: MinRpsPlayPayload = {
        gameId: 'game-1',
        playerId: 'player-1',
      };

      multiplayerService.playMatch.mockReturnValue(null);

      const result = gateway.handlePlayCommand(mockSocket, playPayload);

      expect(result).toBeInstanceOf(Acknowledgement);
      expect(multiplayerService.playMatch).toHaveBeenCalledWith(playPayload);
      expect(multiplayerService.getGameState).not.toHaveBeenCalled();
    });
  });

  describe('handleSelectMoveEvent', () => {
    it('should handle select move event and emit to client only', () => {
      const selectMovePayload: MinRpsSelectMovePayload = {
        gameId: 'game-1',
        playerId: 'player-1',
        move: MinRpsMove.Rock,
      };

      const moveSelectedPayload = new MinRpsMoveSelectedPayload();
      moveSelectedPayload.gameId = 'game-1';
      moveSelectedPayload.playerId = 'player-1';
      moveSelectedPayload.move = MinRpsMove.Rock;

      const gameState = new MinRpsMatchPlayPayload();
      gameState.matchId = 'game-1';
      gameState.player1HasSelectedMove = true;

      multiplayerService.selectMove.mockReturnValue(moveSelectedPayload);
      multiplayerService.getGameState.mockReturnValue(gameState);

      const result = gateway.handleSelectMoveEvent(mockSocket, selectMovePayload);

      expect(result).toBeInstanceOf(Acknowledgement);
      expect(multiplayerService.selectMove).toHaveBeenCalledWith(selectMovePayload);
      expect(mockSocket.emit).toHaveBeenCalled();
      expect(multiplayerService.getGameState).toHaveBeenCalledWith('game-1');
    });
  });

  describe('handleConnection', () => {
    it('should handle new connection and emit connected payload', () => {
      const cryptoSpy = jest.spyOn(crypto, 'randomUUID').mockReturnValue('new-player-id' as any);

      gateway.handleConnection(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalled();

      cryptoSpy.mockRestore();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle disconnect and clean up player data', () => {
      const roomNames = ['game-1', 'game-2'];
      const playerId = 'player-1';

      multiplayerService.getAllPlayerRoomNames.mockReturnValue(roomNames);
      multiplayerService.getPlayerIdForSocket.mockReturnValue(playerId);

      const gameState = new MinRpsMatchPlayPayload();
      gameState.matchId = 'game-1';

      multiplayerService.getGameState.mockReturnValue(gameState);

      gateway.handleDisconnect(mockSocket);

      expect(multiplayerService.getAllPlayerRoomNames).toHaveBeenCalledWith(mockSocket);
      expect(multiplayerService.getPlayerIdForSocket).toHaveBeenCalledWith(mockSocket);
      expect(multiplayerService.removePlayerFromAllRooms).toHaveBeenCalledWith(mockSocket);
      expect(multiplayerService.removePlayerFromGames).toHaveBeenCalledWith(roomNames, playerId);
      expect(multiplayerService.clearPlayerSocket).toHaveBeenCalledWith(mockSocket);
    });

    it('should handle disconnect when player has no id', () => {
      const roomNames = ['game-1'];

      multiplayerService.getAllPlayerRoomNames.mockReturnValue(roomNames);
      multiplayerService.getPlayerIdForSocket.mockReturnValue(undefined);

      const gameState = new MinRpsMatchPlayPayload();
      gameState.matchId = 'game-1';

      multiplayerService.getGameState.mockReturnValue(gameState);

      gateway.handleDisconnect(mockSocket);

      expect(multiplayerService.removePlayerFromGames).not.toHaveBeenCalled();
      expect(multiplayerService.clearPlayerSocket).toHaveBeenCalledWith(mockSocket);
    });
  });
});
