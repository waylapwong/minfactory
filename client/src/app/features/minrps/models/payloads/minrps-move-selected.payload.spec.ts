import { MinRpsMove } from '../../../../core/generated';
import { MinRpsMoveSelectedPayload } from './minrps-move-selected.payload';

describe('MinRpsMoveSelectedPayload', () => {
  it('should create instance with properties', () => {
    const payload = new MinRpsMoveSelectedPayload();
    payload.gameId = 'game-123';
    payload.playerId = 'player-123';
    payload.move = MinRpsMove.Rock;

    expect(payload.gameId).toBe('game-123');
    expect(payload.playerId).toBe('player-123');
    expect(payload.move).toBe(MinRpsMove.Rock);
  });
});
