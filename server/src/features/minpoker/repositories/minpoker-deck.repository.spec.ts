import { MinPokerDeck } from '../models/domains/minpoker-deck';
import { MinPokerDeckRepository } from './minpoker-deck.repository';

describe('MinPokerDeckRepository', () => {
  let repository: MinPokerDeckRepository;

  beforeEach(() => {
    repository = new MinPokerDeckRepository();
  });

  afterEach(() => jest.clearAllMocks());

  describe('save()', () => {
    it('should save a deck and return it', () => {
      const deck = new MinPokerDeck();

      const result = repository.save('match-1', deck);

      expect(result).toBe(deck);
    });

    it('should overwrite an existing deck for the same matchId', () => {
      const deck1 = new MinPokerDeck();
      const deck2 = new MinPokerDeck();

      repository.save('match-1', deck1);
      const result = repository.save('match-1', deck2);

      expect(result).toBe(deck2);
    });
  });

  describe('findOne()', () => {
    it('should return the deck when it exists', () => {
      const deck = new MinPokerDeck();
      repository.save('match-1', deck);

      const result = repository.findOne('match-1');

      expect(result).toBe(deck);
    });

    it('should return null when deck does not exist', () => {
      const result = repository.findOne('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('delete()', () => {
    it('should delete an existing deck', () => {
      const deck = new MinPokerDeck();
      repository.save('match-1', deck);

      repository.delete('match-1');

      expect(repository.findOne('match-1')).toBeNull();
    });

    it('should not throw when deleting a non-existent deck', () => {
      expect(() => repository.delete('non-existent')).not.toThrow();
    });
  });
});
