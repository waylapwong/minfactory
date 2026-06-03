import { MinPokerPlayerIdRepository } from './minpoker-player-id.repository';

describe('MinPokerPlayerIdRepository', () => {
  let repository: MinPokerPlayerIdRepository;

  beforeEach(() => {
    repository = new MinPokerPlayerIdRepository();
  });

  afterEach(() => jest.clearAllMocks());

  describe('save()', () => {
    it('should save a socket-to-playerId mapping', () => {
      repository.save('socket-1', 'player-1');

      expect(repository.findOne('socket-1')).toBe('player-1');
    });

    it('should overwrite an existing mapping for the same socket', () => {
      repository.save('socket-1', 'player-1');
      repository.save('socket-1', 'player-2');

      expect(repository.findOne('socket-1')).toBe('player-2');
    });
  });

  describe('findOne()', () => {
    it('should return the playerId for a known socketId', () => {
      repository.save('socket-1', 'player-1');

      expect(repository.findOne('socket-1')).toBe('player-1');
    });

    it('should return null for an unknown socketId', () => {
      expect(repository.findOne('unknown-socket')).toBeNull();
    });
  });

  describe('findByPlayerId()', () => {
    it('should return the socketId for a known playerId', () => {
      repository.save('socket-1', 'player-1');

      expect(repository.findByPlayerId('player-1')).toBe('socket-1');
    });

    it('should return null when playerId is not found', () => {
      repository.save('socket-1', 'player-1');

      expect(repository.findByPlayerId('unknown-player')).toBeNull();
    });
  });

  describe('delete()', () => {
    it('should remove the mapping for a known socketId', () => {
      repository.save('socket-1', 'player-1');

      repository.delete('socket-1');

      expect(repository.findOne('socket-1')).toBeNull();
    });

    it('should not throw when deleting a non-existent socketId', () => {
      expect(() => repository.delete('non-existent')).not.toThrow();
    });
  });
});
