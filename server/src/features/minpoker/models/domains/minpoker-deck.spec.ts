import { MinPokerDeck } from './minpoker-deck';

describe('MinPokerDeck', () => {
  it('should have 52 cards initially', () => {
    const deck = new MinPokerDeck();

    expect(deck.getCardCount()).toBe(52);
  });

  it('should contain all 52 unique cards', () => {
    const deck = new MinPokerDeck();
    const dealt = deck.deal(52);

    expect(dealt).toHaveLength(52);
    expect(new Set(dealt).size).toBe(52);
  });

  it('should contain all four suits', () => {
    const deck = new MinPokerDeck();
    const dealt = deck.deal(52);

    const suits = new Set(dealt.map((card) => card.slice(-1)));
    expect(suits).toContain('s');
    expect(suits).toContain('h');
    expect(suits).toContain('d');
    expect(suits).toContain('c');
  });

  it('should contain all 13 ranks per suit', () => {
    const deck = new MinPokerDeck();
    const dealt = deck.deal(52);

    const hearts = dealt.filter((card) => card.endsWith('h'));
    expect(hearts).toHaveLength(13);
  });

  describe('shuffle()', () => {
    it('should keep all 52 cards after shuffle', () => {
      const deck = new MinPokerDeck();

      deck.shuffle();

      expect(deck.getCardCount()).toBe(52);
    });

    it('should produce a shuffled order different from sorted order', () => {
      const sorted = new MinPokerDeck();
      const shuffled = new MinPokerDeck();
      shuffled.shuffle();

      const sortedCards = sorted.deal(52);
      const shuffledCards = shuffled.deal(52);

      expect(shuffledCards).not.toEqual(sortedCards);
    });
  });

  describe('deal()', () => {
    it('should deal the requested number of cards', () => {
      const deck = new MinPokerDeck();

      const hand = deck.deal(2);

      expect(hand).toHaveLength(2);
      expect(deck.getCardCount()).toBe(50);
    });

    it('should reduce the deck size after dealing', () => {
      const deck = new MinPokerDeck();

      deck.deal(5);

      expect(deck.getCardCount()).toBe(47);
    });

    it('should throw when dealing more cards than available', () => {
      const deck = new MinPokerDeck();
      deck.deal(52);

      expect(() => deck.deal(1)).toThrow('Not enough cards in deck');
    });
  });
});
