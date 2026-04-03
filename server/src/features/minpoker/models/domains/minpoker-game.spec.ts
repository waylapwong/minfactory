import { MinPokerGame } from './minpoker-game';
import { MinPokerPlayer } from './minpoker-player';

describe('MinPokerGame', () => {
  it('should have default values', () => {
    const domain = new MinPokerGame();

    expect(domain.bigBlind).toBe(2);
    expect(domain.smallBlind).toBe(1);
    expect(domain.tableSize).toBe(6);
    expect(domain.players).toBeInstanceOf(Array);
    expect(domain.observers).toBeInstanceOf(Map);
  });

  it('should assign partial values via constructor', () => {
    const domain = new MinPokerGame({ id: 'id-1', name: 'Table A' });

    expect(domain.id).toBe('id-1');
    expect(domain.name).toBe('Table A');
  });

  it('should add observer only once', () => {
    const domain = new MinPokerGame();

    domain.addObserver('observer-1');
    domain.addObserver('observer-1');

    expect(domain.observers.size).toBe(1);
    expect(domain.isObserver('observer-1')).toBe(true);
  });

  it('should seat observer on free seat', () => {
    const domain = new MinPokerGame();
    const player = new MinPokerPlayer({ avatar: 'avatar.svg', id: 'player-1', name: 'Alice' });

    domain.addObserver('player-1');
    domain.seatPlayer(player, 2);

    expect(domain.players[2]).toEqual(expect.objectContaining({ id: 'player-1', seat: 2 }));
    expect(domain.isObserver('player-1')).toBe(false);
  });

  it('should remove player from seat by player id', () => {
    const domain = new MinPokerGame();

    domain.seatPlayer(new MinPokerPlayer({ id: 'player-1', name: 'Alice' }), 0);
    domain.removePlayer('player-1');

    expect(domain.players[0]).toBeNull();
  });
});
