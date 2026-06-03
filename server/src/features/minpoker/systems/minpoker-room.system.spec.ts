import { MinPokerRoomSystem } from './minpoker-room.system';

describe('MinPokerRoomSystem', () => {
  let system: MinPokerRoomSystem;
  let socket: { id: string; join: jest.Mock; leave: jest.Mock };

  beforeEach(() => {
    system = new MinPokerRoomSystem();
    socket = { id: 'socket-1', join: jest.fn(), leave: jest.fn() };
  });

  afterEach(() => jest.clearAllMocks());

  describe('addPlayerToRoom()', () => {
    it('should call socket.join and track the player in the room', () => {
      system.addPlayerToRoom(socket as any, 'room-1');

      expect(socket.join).toHaveBeenCalledWith('room-1');
      expect(system.getPlayerRoomName(socket as any)).toBe('room-1');
    });

    it('should not create a duplicate room entry when room already exists', () => {
      const socket2 = { id: 'socket-2', join: jest.fn(), leave: jest.fn() };

      system.addPlayerToRoom(socket as any, 'room-1');
      system.addPlayerToRoom(socket2 as any, 'room-1');

      expect(system.getPlayerRoomName(socket as any)).toBe('room-1');
      expect(system.getPlayerRoomName(socket2 as any)).toBe('room-1');
    });
  });

  describe('getPlayerRoomName()', () => {
    it('should return the room name when player is in a room', () => {
      system.addPlayerToRoom(socket as any, 'room-1');

      expect(system.getPlayerRoomName(socket as any)).toBe('room-1');
    });

    it('should return null when player is not in any room', () => {
      expect(system.getPlayerRoomName(socket as any)).toBeNull();
    });
  });

  describe('removePlayerFromRoom()', () => {
    it('should remove player from room and call socket.leave', () => {
      system.addPlayerToRoom(socket as any, 'room-1');

      system.removePlayerFromRoom(socket as any, 'room-1');

      expect(socket.leave).toHaveBeenCalledWith('room-1');
      expect(system.getPlayerRoomName(socket as any)).toBeNull();
    });

    it('should delete the room when the last player leaves', () => {
      system.addPlayerToRoom(socket as any, 'room-1');

      system.removePlayerFromRoom(socket as any, 'room-1');

      // Room should be gone; adding same socket again should work cleanly
      system.addPlayerToRoom(socket as any, 'room-1');
      expect(system.getPlayerRoomName(socket as any)).toBe('room-1');
    });

    it('should not throw when room does not exist', () => {
      expect(() => system.removePlayerFromRoom(socket as any, 'non-existent')).not.toThrow();
      expect(socket.leave).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('removePlayerFromAllRooms()', () => {
    it('should remove player from all rooms they are in', () => {
      const socket2 = { id: 'socket-2', join: jest.fn(), leave: jest.fn() };
      system.addPlayerToRoom(socket as any, 'room-1');
      system.addPlayerToRoom(socket as any, 'room-2');
      system.addPlayerToRoom(socket2 as any, 'room-1');

      system.removePlayerFromAllRooms(socket as any);

      expect(system.getPlayerRoomName(socket as any)).toBeNull();
      expect(system.getPlayerRoomName(socket2 as any)).toBe('room-1');
    });

    it('should skip rooms where the player is not present', () => {
      const socket2 = { id: 'socket-2', join: jest.fn(), leave: jest.fn() };
      system.addPlayerToRoom(socket2 as any, 'room-1');
      system.addPlayerToRoom(socket as any, 'room-2');

      system.removePlayerFromAllRooms(socket as any);

      expect(system.getPlayerRoomName(socket as any)).toBeNull();
      expect(system.getPlayerRoomName(socket2 as any)).toBe('room-1');
    });

    it('should not throw when player is not in any room', () => {
      expect(() => system.removePlayerFromAllRooms(socket as any)).not.toThrow();
    });
  });
});
