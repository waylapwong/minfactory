import { MinRpsJoinedPayload } from './minrps-joined.payload';

describe('MinRpsJoinedPayload', () => {
  it('should create instance with properties', () => {
    const payload = new MinRpsJoinedPayload();
    payload.gameId = 'game-123';
    payload.playerId = 'player-123';

    expect(payload.gameId).toBe('game-123');
    expect(payload.playerId).toBe('player-123');
  });
});
