import { MinRpsMove, MinRpsResult } from '../../../../core/generated';
import { MinRpsPlayedPayload } from './minrps-played.payload';

describe('MinRpsPlayedPayload', () => {
  it('should create instance with all properties', () => {
    const payload = new MinRpsPlayedPayload();
    payload.gameId = 'game-123';
    payload.player1Id = 'p1';
    payload.player1Move = MinRpsMove.Rock;
    payload.player1Result = MinRpsResult.Player1;
    payload.player2Id = 'p2';
    payload.player2Move = MinRpsMove.Scissors;
    payload.player2Result = MinRpsResult.Player2;

    expect(payload.gameId).toBe('game-123');
    expect(payload.player1Id).toBe('p1');
    expect(payload.player1Move).toBe(MinRpsMove.Rock);
    expect(payload.player1Result).toBe(MinRpsResult.Player1);
    expect(payload.player2Id).toBe('p2');
    expect(payload.player2Move).toBe(MinRpsMove.Scissors);
    expect(payload.player2Result).toBe(MinRpsResult.Player2);
  });
});
