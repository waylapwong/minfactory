import { MinPokerGame } from './minpoker-game';

describe('MinPokerGame', () => {
  it('should have default values', () => {
    const domain = new MinPokerGame();

    expect(domain.bigBlind).toBe(2);
    expect(domain.smallBlind).toBe(1);
    expect(domain.tableSize).toBe(6);
    expect(domain.players).toBeInstanceOf(Array);
  });

  it('should assign partial values via constructor', () => {
    const domain = new MinPokerGame({ id: 'id-1', name: 'Table A' });

    expect(domain.id).toBe('id-1');
    expect(domain.name).toBe('Table A');
  });
});
