import { MinRpsConnectedPayload } from './minrps-connected.payload';

describe('MinRpsConnectedPayload', () => {
  it('should create instance with playerId', () => {
    const payload = new MinRpsConnectedPayload();
    payload.playerId = 'player-123';

    expect(payload.playerId).toBe('player-123');
  });
});
