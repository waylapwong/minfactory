import { MinRpsPlayPayload } from './minrps-play.payload';

describe('MinRpsPlayPayload', () => {
  it('should create instance with properties', () => {
    const payload = new MinRpsPlayPayload();
    payload.gameId = 'game-123';
    payload.playerId = 'player-123';

    expect(payload.gameId).toBe('game-123');
    expect(payload.playerId).toBe('player-123');
  });
});
