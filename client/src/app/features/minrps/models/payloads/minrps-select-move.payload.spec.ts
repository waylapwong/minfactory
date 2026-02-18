import { MinRpsMove } from '../../../../core/generated';
import { MinRpsSelectMovePayload } from './minrps-select-move.payload';

describe('MinRpsSelectMovePayload', () => {
  it('should create instance with properties', () => {
    const payload = new MinRpsSelectMovePayload();
    payload.gameId = 'game-123';
    payload.playerId = 'player-123';
    payload.move = MinRpsMove.Paper;

    expect(payload.gameId).toBe('game-123');
    expect(payload.playerId).toBe('player-123');
    expect(payload.move).toBe(MinRpsMove.Paper);
  });
});
