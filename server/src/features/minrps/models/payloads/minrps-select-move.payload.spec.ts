import { MinRpsSelectMovePayload } from './minrps-select-move.payload';
import { MinRpsMove } from '../enums/minrps-move.enum';

describe('MinRpsSelectMovePayload', () => {
  it('should create instance with properties', () => {
    const payload = new MinRpsSelectMovePayload();
    payload.gameId = 'game-1';
    payload.playerId = 'player-1';
    payload.move = MinRpsMove.Rock;

    expect(payload.gameId).toBe('game-1');
    expect(payload.playerId).toBe('player-1');
    expect(payload.move).toBe(MinRpsMove.Rock);
  });
});
