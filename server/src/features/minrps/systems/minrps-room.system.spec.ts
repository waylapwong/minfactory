import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { MinRpsRoomSystem } from './minrps-room.system';

describe('MinRpsRoomSystem', () => {
  let system: MinRpsRoomSystem;
  let mockSocket: jest.Mocked<Socket>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinRpsRoomSystem],
    }).compile();

    system = module.get<MinRpsRoomSystem>(MinRpsRoomSystem);

    mockSocket = {
      id: 'test-socket-id',
      join: jest.fn(),
      leave: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(system).toBeDefined();
  });

  describe('addPlayerToRoom', () => {
    it('should add player to room and call socket.join', () => {
      system.addPlayerToRoom(mockSocket, 'room1');

      expect(mockSocket.join).toHaveBeenCalledWith('room1');
    });

    it('should add player to existing room', () => {
      system.addPlayerToRoom(mockSocket, 'room1');

      const mockSocket2 = {
        id: 'socket-2',
        join: jest.fn(),
        leave: jest.fn(),
      } as any;

      system.addPlayerToRoom(mockSocket2, 'room1');

      expect(mockSocket.join).toHaveBeenCalledWith('room1');
      expect(mockSocket2.join).toHaveBeenCalledWith('room1');
      expect(system.getPlayerRoomName(mockSocket)).toBe('room1');
      expect(system.getPlayerRoomName(mockSocket2)).toBe('room1');
    });
  });

  describe('getPlayerRoomName', () => {
    it('should return null when player is not in any rooms', () => {
      const roomName = system.getPlayerRoomName(mockSocket);

      expect(roomName).toBeNull();
    });

    it('should return room player is in', () => {
      system.addPlayerToRoom(mockSocket, 'room1');

      const roomName = system.getPlayerRoomName(mockSocket);

      expect(roomName).toBe('room1');
    });
  });

  describe('removePlayerFromRoom', () => {
    it('should remove player from room and call socket.leave', () => {
      system.addPlayerToRoom(mockSocket, 'room1');

      system.removePlayerFromRoom(mockSocket, 'room1');

      expect(mockSocket.leave).toHaveBeenCalledWith('room1');
    });

    it('should remove player from room list', () => {
      system.addPlayerToRoom(mockSocket, 'room1');
      system.removePlayerFromRoom(mockSocket, 'room1');

      const roomName = system.getPlayerRoomName(mockSocket);

      expect(roomName).toBeNull();
    });

    it('should not delete room when other players remain', () => {
      const mockSocket2 = {
        id: 'socket-2',
        join: jest.fn(),
        leave: jest.fn(),
      } as any;

      system.addPlayerToRoom(mockSocket, 'room1');
      system.addPlayerToRoom(mockSocket2, 'room1');

      system.removePlayerFromRoom(mockSocket, 'room1');

      const roomName = system.getPlayerRoomName(mockSocket2);
      expect(roomName).toBe('room1');
    });

    it('should handle removing player from non-existent room', () => {
      expect(() => {
        system.removePlayerFromRoom(mockSocket, 'non-existent-room');
      }).not.toThrow();

      expect(mockSocket.leave).toHaveBeenCalledWith('non-existent-room');
    });
  });

  describe('removePlayerFromAllRooms', () => {
    it('should remove player from all rooms', () => {
      system.addPlayerToRoom(mockSocket, 'room1');
      system.addPlayerToRoom(mockSocket, 'room2');
      system.addPlayerToRoom(mockSocket, 'room3');

      system.removePlayerFromAllRooms(mockSocket);

      const roomName = system.getPlayerRoomName(mockSocket);
      expect(roomName).toBeNull();
      expect(mockSocket.leave).toHaveBeenCalledWith('room1');
      expect(mockSocket.leave).toHaveBeenCalledWith('room2');
      expect(mockSocket.leave).toHaveBeenCalledWith('room3');
    });

    it('should handle player not in any rooms', () => {
      expect(() => {
        system.removePlayerFromAllRooms(mockSocket);
      }).not.toThrow();
    });
  });
});
