import { MinRpsMove } from '../../../../core/generated';
import { MinRpsGameStateUpdatePayload } from './minrps-game-state-update.payload';

describe('MinRpsGameStateUpdatePayload', () => {
  it('should create instance with all properties', () => {
    const payload = new MinRpsGameStateUpdatePayload();
    payload.gameId = 'game-123';
    payload.player1Id = 'p1';
    payload.player1Name = 'Player 1';
    payload.player1HasSelectedMove = true;
    payload.player1Move = MinRpsMove.Rock;
    payload.player2Id = 'p2';
    payload.player2Name = 'Player 2';
    payload.player2HasSelectedMove = false;
    payload.player2Move = MinRpsMove.None;

    expect(payload.gameId).toBe('game-123');
    expect(payload.player1Id).toBe('p1');
    expect(payload.player1Name).toBe('Player 1');
    expect(payload.player1HasSelectedMove).toBe(true);
    expect(payload.player1Move).toBe(MinRpsMove.Rock);
    expect(payload.player2Id).toBe('p2');
    expect(payload.player2Name).toBe('Player 2');
    expect(payload.player2HasSelectedMove).toBe(false);
    expect(payload.player2Move).toBe(MinRpsMove.None);
  });
});
