import { MinRpsGameEvent } from './minrps-game-event.enum';

describe('MinRpsGameEvent', () => {
  it('should have all event values defined', () => {
    expect(MinRpsGameEvent.Connected).toBe('minrps.game.connected');
    expect(MinRpsGameEvent.Disconnected).toBe('minrps.game.disconnected');
    expect(MinRpsGameEvent.Join).toBe('minrps.game.join');
    expect(MinRpsGameEvent.Joined).toBe('minrps.game.joined');
    expect(MinRpsGameEvent.Leave).toBe('minrps.game.leave');
    expect(MinRpsGameEvent.Left).toBe('minrps.game.left');
    expect(MinRpsGameEvent.TakeSeat).toBe('minrps.game.take-seat');
    expect(MinRpsGameEvent.SelectMove).toBe('minrps.game.select-move');
    expect(MinRpsGameEvent.MoveSelected).toBe('minrps.game.move-selected');
    expect(MinRpsGameEvent.Play).toBe('minrps.game.play');
    expect(MinRpsGameEvent.Played).toBe('minrps.game.played');
    expect(MinRpsGameEvent.GameStateUpdate).toBe('minrps.game.state-update');
  });
});
