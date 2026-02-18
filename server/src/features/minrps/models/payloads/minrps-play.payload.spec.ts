import { MinRpsPlayPayload } from './minrps-play.payload';

describe('MinRpsPlayPayload', () => {
  it('should create instance with properties', () => {
    const payload = new MinRpsPlayPayload();
    payload.gameId = 'game-1';
    payload.playerId = 'player-1';

    expect(payload.gameId).toBe('game-1');
    expect(payload.playerId).toBe('player-1');
  });
});
