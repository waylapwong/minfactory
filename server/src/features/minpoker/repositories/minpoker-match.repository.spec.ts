import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerMatchRepository } from './minpoker-match.repository';

describe('MinPokerMatchRepository', () => {
  let repository: MinPokerMatchRepository;

  beforeEach(() => {
    repository = new MinPokerMatchRepository();
  });

  afterEach(() => jest.clearAllMocks());

  describe('save()', () => {
    it('should save a match and return it', () => {
      const match = new MinPokerGame({ id: 'match-1', name: 'Table 1' });

      const result = repository.save(match);

      expect(result).toBe(match);
    });

    it('should overwrite an existing match with the same id', () => {
      const match1 = new MinPokerGame({ id: 'match-1', name: 'Table 1' });
      const match2 = new MinPokerGame({ id: 'match-1', name: 'Table 1 Updated' });

      repository.save(match1);
      const result = repository.save(match2);

      expect(result.name).toBe('Table 1 Updated');
    });
  });

  describe('findOne()', () => {
    it('should return the match when it exists', () => {
      const match = new MinPokerGame({ id: 'match-1', name: 'Table 1' });
      repository.save(match);

      const result = repository.findOne('match-1');

      expect(result).toBe(match);
    });

    it('should return null when match does not exist', () => {
      const result = repository.findOne('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('delete()', () => {
    it('should delete an existing match', () => {
      const match = new MinPokerGame({ id: 'match-1', name: 'Table 1' });
      repository.save(match);

      repository.delete('match-1');

      expect(repository.findOne('match-1')).toBeNull();
    });

    it('should not throw when deleting a non-existent match', () => {
      expect(() => repository.delete('non-existent')).not.toThrow();
    });
  });
});
