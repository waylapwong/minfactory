import { MinRpsLeavePayload } from './minrps-leave.payload';

describe('MinRpsLeavePayload', () => {
  it('should create instance with properties', () => {
    const payload = new MinRpsLeavePayload();
    payload.gameId = 'game-1';
    payload.playerId = 'player-1';

    expect(payload.gameId).toBe('game-1');
    expect(payload.playerId).toBe('player-1');
  });
});
