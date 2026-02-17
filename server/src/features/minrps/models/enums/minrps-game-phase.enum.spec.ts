import { MinRpsGamePhase } from './minrps-game-phase.enum';

describe('MinRpsGamePhase', () => {
  it('should have GameStart value', () => {
    expect(MinRpsGamePhase.GameStart).toBe('gameStart');
  });

  it('should have WaitingForPlayer1Move value', () => {
    expect(MinRpsGamePhase.WaitingForPlayer1Move).toBe('waitingForPlayer1Move');
  });

  it('should have WaitingForPlayer2Move value', () => {
    expect(MinRpsGamePhase.WaitingForPlayer2Move).toBe('waitingForPlayer2Move');
  });

  it('should have GameResult value', () => {
    expect(MinRpsGamePhase.GameResult).toBe('gameResult');
  });

  it('should have GameEnd value', () => {
    expect(MinRpsGamePhase.GameEnd).toBe('gameEnd');
  });
});
