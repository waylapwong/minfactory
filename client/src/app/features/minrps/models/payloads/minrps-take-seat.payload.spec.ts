import { MinRpsTakeSeatPayload } from './minrps-take-seat.payload';

describe('MinRpsTakeSeatPayload', () => {
  it('should create instance with all properties', () => {
    const payload = new MinRpsTakeSeatPayload();
    payload.gameId = 'game-123';
    payload.playerId = 'player-123';
    payload.playerName = 'Alice';
    payload.seat = 1;

    expect(payload.gameId).toBe('game-123');
    expect(payload.playerId).toBe('player-123');
    expect(payload.playerName).toBe('Alice');
    expect(payload.seat).toBe(1);
  });
});
