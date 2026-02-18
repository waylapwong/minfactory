import { MinRpsJoinPayload } from './minrps-join.payload';

describe('MinRpsJoinPayload', () => {
  it('should create instance with properties', () => {
    const payload = new MinRpsJoinPayload();
    payload.gameId = 'game-1';
    payload.playerId = 'player-1';

    expect(payload.gameId).toBe('game-1');
    expect(payload.playerId).toBe('player-1');
  });
});
