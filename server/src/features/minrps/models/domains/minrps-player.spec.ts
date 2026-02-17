import { MinRpsPlayer } from './minrps-player';
import { MinRpsMove } from '../enums/minrps-move.enum';

describe('MinRpsPlayer', () => {
  it('should create with default values', () => {
    const player = new MinRpsPlayer();
    
    expect(player.name).toBe('');
    expect(player.move).toBe(MinRpsMove.None);
  });

  it('should allow setting name', () => {
    const player = new MinRpsPlayer();
    player.name = 'test-player-name';
    
    expect(player.name).toBe('test-player-name');
  });

  it('should allow setting move', () => {
    const player = new MinRpsPlayer();
    player.move = MinRpsMove.Rock;
    
    expect(player.move).toBe(MinRpsMove.Rock);
  });
});
