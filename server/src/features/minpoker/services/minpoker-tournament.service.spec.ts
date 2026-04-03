import { Test, TestingModule } from '@nestjs/testing';
import { MINPOKER_GAME_REPOSITORY_MOCK } from '../mocks/minpoker-game.repository.mock';
import { MINPOKER_MATCH_REPOSITORY_MOCK } from '../mocks/minpoker-match.repository.mock';
import { MINPOKER_PLAYER_ID_REPOSITORY_MOCK } from '../mocks/minpoker-player-id.repository.mock';
import { MINPOKER_ROOM_SYSTEM_MOCK } from '../mocks/minpoker-room.system.mock';
import { MinPokerJoinCommand } from '../models/commands/minpoker-join.command';
import { MinPokerLeaveCommand } from '../models/commands/minpoker-leave.command';
import { MinPokerSeatCommand } from '../models/commands/minpoker-seat.command';
import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerPlayer } from '../models/domains/minpoker-player';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';
import { MinPokerGameRepository } from '../repositories/minpoker-game.repository';
import { MinPokerMatchRepository } from '../repositories/minpoker-match.repository';
import { MinPokerPlayerIdRepository } from '../repositories/minpoker-player-id.repository';
import { MinPokerRoomSystem } from '../systems/minpoker-room.system';
import { MinPokerTournamentService } from './minpoker-tournament.service';

describe('MinpokerTournamentService', () => {
  let service: MinPokerTournamentService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinPokerTournamentService,
        { provide: MinPokerGameRepository, useValue: MINPOKER_GAME_REPOSITORY_MOCK },
        { provide: MinPokerMatchRepository, useValue: MINPOKER_MATCH_REPOSITORY_MOCK },
        { provide: MinPokerPlayerIdRepository, useValue: MINPOKER_PLAYER_ID_REPOSITORY_MOCK },
        { provide: MinPokerRoomSystem, useValue: MINPOKER_ROOM_SYSTEM_MOCK },
      ],
    }).compile();

    service = module.get<MinPokerTournamentService>(MinPokerTournamentService);
    MINPOKER_MATCH_REPOSITORY_MOCK.save.mockImplementation((match: MinPokerGame) => match);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should create player id and register it for socket', () => {
      const socket = { data: {}, id: 'socket-1' } as any;

      const result = service.handleConnection(socket);

      expect(result.playerId).toEqual(expect.any(String));
      expect(socket.data.playerId).toBe(result.playerId);
      expect(MINPOKER_PLAYER_ID_REPOSITORY_MOCK.save).toHaveBeenCalledWith('socket-1', result.playerId);
    });
  });

  describe('joinMatch', () => {
    it('should add player as observer to existing poker table room', async () => {
      const socket = { data: { playerId: 'player-1' }, id: 'socket-1', join: jest.fn(), leave: jest.fn() } as any;
      const command: MinPokerJoinCommand = { matchId: 'match-1', playerId: 'player-1' };
      const entity = Object.assign(new MinPokerGameEntity(), {
        bigBlind: 2,
        createdAt: new Date('2026-03-27T10:00:00.000Z'),
        id: 'match-1',
        name: 'Table 1',
        smallBlind: 1,
        tableSize: 6,
      });

      MINPOKER_MATCH_REPOSITORY_MOCK.findOne.mockReturnValue(null);
      MINPOKER_GAME_REPOSITORY_MOCK.findOne.mockResolvedValue(entity);
      MINPOKER_PLAYER_ID_REPOSITORY_MOCK.findOne.mockReturnValue('player-1');

      const result = await service.joinMatch(socket, command);

      expect(MINPOKER_ROOM_SYSTEM_MOCK.removePlayerFromAllRooms).toHaveBeenCalledWith(socket);
      expect(MINPOKER_ROOM_SYSTEM_MOCK.addPlayerToRoom).toHaveBeenCalledWith(socket, 'match-1');
      expect(MINPOKER_GAME_REPOSITORY_MOCK.findOne).toHaveBeenCalledWith('match-1');
      expect(result.matchId).toBe('match-1');
      expect(result.observerIds).toEqual(['player-1']);
    });

    it('should reject join when payload playerId does not match socket playerId', async () => {
      const socket = { data: { playerId: 'player-1' }, id: 'socket-1' } as any;
      const command: MinPokerJoinCommand = { matchId: 'match-1', playerId: 'player-2' };
      MINPOKER_PLAYER_ID_REPOSITORY_MOCK.findOne.mockReturnValue('player-1');

      await expect(service.joinMatch(socket, command)).rejects.toThrow('Player id mismatch');
      expect(MINPOKER_ROOM_SYSTEM_MOCK.addPlayerToRoom).not.toHaveBeenCalled();
    });
  });

  describe('seatPlayer', () => {
    it('should seat observer on selected free seat', async () => {
      const socket = { data: { playerId: 'player-1' }, id: 'socket-1' } as any;
      const match = new MinPokerGame({ id: 'match-1', name: 'Table 1' });
      match.addObserver('player-1');
      const command: MinPokerSeatCommand = {
        avatar: 'woman-1.svg',
        matchId: 'match-1',
        playerId: 'player-1',
        playerName: 'Alice',
        seat: 3,
      };

      MINPOKER_MATCH_REPOSITORY_MOCK.findOne.mockReturnValue(match);
      MINPOKER_PLAYER_ID_REPOSITORY_MOCK.findOne.mockReturnValue('player-1');

      const result = await service.seatPlayer(socket, command);

      expect(result.matchId).toBe('match-1');
      expect(result.players).toEqual([
        expect.objectContaining({ avatar: 'woman-1.svg', id: 'player-1', name: 'Alice', seat: 3 }),
      ]);
      expect(result.observerIds).toEqual([]);
    });

    it('should reject seat when payload playerId does not match socket playerId', async () => {
      const socket = { data: { playerId: 'player-1' }, id: 'socket-1' } as any;
      const command: MinPokerSeatCommand = {
        avatar: 'woman-1.svg',
        matchId: 'match-1',
        playerId: 'player-2',
        playerName: 'Alice',
        seat: 3,
      };
      MINPOKER_PLAYER_ID_REPOSITORY_MOCK.findOne.mockReturnValue('player-1');

      await expect(service.seatPlayer(socket, command)).rejects.toThrow('Player id mismatch');
    });
  });

  describe('leaveMatch', () => {
    it('should remove observer from match and return updated event', () => {
      const socket = { data: { playerId: 'observer-1' }, id: 'socket-1', leave: jest.fn() } as any;
      const match = new MinPokerGame({ id: 'match-1', name: 'Table 1' });
      match.addObserver('observer-1');
      match.addObserver('observer-2');
      const command: MinPokerLeaveCommand = { matchId: 'match-1', playerId: 'observer-1' };

      MINPOKER_MATCH_REPOSITORY_MOCK.findOne.mockReturnValue(match);
      MINPOKER_PLAYER_ID_REPOSITORY_MOCK.findOne.mockReturnValue('observer-1');

      const result = service.leaveMatch(socket, command);

      expect(result?.observerIds).toEqual(['observer-2']);
      expect(MINPOKER_MATCH_REPOSITORY_MOCK.save).toHaveBeenCalled();
      expect(MINPOKER_MATCH_REPOSITORY_MOCK.delete).not.toHaveBeenCalled();
      expect(MINPOKER_ROOM_SYSTEM_MOCK.removePlayerFromRoom).toHaveBeenCalledWith(socket, 'match-1');
    });

    it('should remove seated player from match and return updated event', () => {
      const socket = { data: { playerId: 'player-1' }, id: 'socket-1', leave: jest.fn() } as any;
      const match = new MinPokerGame({ id: 'match-1', name: 'Table 1' });
      match.addObserver('observer-1');
      match.seatPlayer(new MinPokerPlayer({ avatar: 'man-1.svg', id: 'player-1', name: 'Alice' }), 0);
      const command: MinPokerLeaveCommand = { matchId: 'match-1', playerId: 'player-1' };

      MINPOKER_MATCH_REPOSITORY_MOCK.findOne.mockReturnValue(match);
      MINPOKER_PLAYER_ID_REPOSITORY_MOCK.findOne.mockReturnValue('player-1');

      const result = service.leaveMatch(socket, command);

      expect(result?.players).toEqual([]);
      expect(result?.observerIds).toEqual(['observer-1']);
      expect(MINPOKER_MATCH_REPOSITORY_MOCK.save).toHaveBeenCalled();
      expect(MINPOKER_ROOM_SYSTEM_MOCK.removePlayerFromRoom).toHaveBeenCalledWith(socket, 'match-1');
    });

    it('should delete match and return null when last participant leaves', () => {
      const socket = { data: { playerId: 'observer-1' }, id: 'socket-1', leave: jest.fn() } as any;
      const match = new MinPokerGame({ id: 'match-1', name: 'Table 1' });
      match.addObserver('observer-1');
      const command: MinPokerLeaveCommand = { matchId: 'match-1', playerId: 'observer-1' };

      MINPOKER_MATCH_REPOSITORY_MOCK.findOne.mockReturnValue(match);
      MINPOKER_PLAYER_ID_REPOSITORY_MOCK.findOne.mockReturnValue('observer-1');

      const result = service.leaveMatch(socket, command);

      expect(result).toBeNull();
      expect(MINPOKER_MATCH_REPOSITORY_MOCK.delete).toHaveBeenCalledWith('match-1');
      expect(MINPOKER_MATCH_REPOSITORY_MOCK.save).not.toHaveBeenCalledWith(match);
      expect(MINPOKER_ROOM_SYSTEM_MOCK.removePlayerFromRoom).toHaveBeenCalledWith(socket, 'match-1');
    });

    it('should reject leave when payload playerId does not match socket playerId', () => {
      const socket = { data: { playerId: 'observer-1' }, id: 'socket-1' } as any;
      const command: MinPokerLeaveCommand = { matchId: 'match-1', playerId: 'observer-2' };
      MINPOKER_PLAYER_ID_REPOSITORY_MOCK.findOne.mockReturnValue('observer-1');

      expect(() => service.leaveMatch(socket, command)).toThrow('Player id mismatch');
      expect(MINPOKER_MATCH_REPOSITORY_MOCK.findOne).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should remove player from active match and return updated event', () => {
      const socket = { id: 'socket-1', leave: jest.fn() } as any;
      const match = new MinPokerGame({ id: 'match-1', name: 'Table 1' });
      match.addObserver('observer-1');
      match.seatPlayer({ avatar: 'man-1.svg', id: 'player-1', name: 'Alice', seat: -1 } as any, 0);

      MINPOKER_PLAYER_ID_REPOSITORY_MOCK.findOne.mockReturnValue('player-1');
      MINPOKER_ROOM_SYSTEM_MOCK.getPlayerRoomName.mockReturnValue('match-1');
      MINPOKER_MATCH_REPOSITORY_MOCK.findOne.mockReturnValue(match);

      const result = service.handleDisconnect(socket);

      expect(result?.disconnectedEvent).toEqual(expect.objectContaining({ matchId: 'match-1', playerId: 'player-1' }));
      expect(result?.updatedEvent?.matchId).toBe('match-1');
      expect(result?.updatedEvent?.players).toEqual([]);
      expect(result?.updatedEvent?.observerIds).toEqual(['observer-1']);
      expect(MINPOKER_ROOM_SYSTEM_MOCK.removePlayerFromRoom).toHaveBeenCalledWith(socket, 'match-1');
      expect(MINPOKER_ROOM_SYSTEM_MOCK.removePlayerFromAllRooms).toHaveBeenCalledWith(socket);
      expect(MINPOKER_PLAYER_ID_REPOSITORY_MOCK.delete).toHaveBeenCalledWith('socket-1');
    });

    it('should cleanup rooms and return null when disconnected socket has no player id', () => {
      const socket = { data: {}, id: 'socket-2' } as any;

      MINPOKER_PLAYER_ID_REPOSITORY_MOCK.findOne.mockReturnValue(null);
      MINPOKER_ROOM_SYSTEM_MOCK.getPlayerRoomName.mockReturnValue(null);

      const result = service.handleDisconnect(socket);

      expect(result).toBeNull();
      expect(MINPOKER_ROOM_SYSTEM_MOCK.removePlayerFromAllRooms).toHaveBeenCalledWith(socket);
      expect(MINPOKER_MATCH_REPOSITORY_MOCK.findOne).not.toHaveBeenCalled();
    });
  });
});
