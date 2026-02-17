import { MinRpsTakeSeatPayload } from './minrps-take-seat.payload';

describe('MinRpsTakeSeatPayload', () => {
  it('should create instance with properties', () => {
    const payload = new MinRpsTakeSeatPayload();
    payload.gameId = 'game-1';
    payload.playerId = 'player-1';
    payload.playerName = 'Player One';
    payload.seat = 1;

    expect(payload.gameId).toBe('game-1');
    expect(payload.playerId).toBe('player-1');
    expect(payload.playerName).toBe('Player One');
    expect(payload.seat).toBe(1);
  });
});
