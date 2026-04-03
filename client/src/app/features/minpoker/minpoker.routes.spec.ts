import { leaveGameGuard } from '../../shared/guards/leave-game.guard';
import { MINPOKER_ROUTES, MinPokerPath } from './minpoker.routes';
import { MinPokerGameComponent } from './pages/minpoker-game/minpoker-game.component';
import { MinPokerHomeComponent } from './pages/minpoker-home/minpoker-home.component';
import { MinPokerLobbyComponent } from './pages/minpoker-lobby/minpoker-lobby.component';

describe('MINPOKER_ROUTES', () => {
  it('should expose the expected enum paths', () => {
    expect(MinPokerPath.Root).toBe('');
    expect(MinPokerPath.Game).toBe('game');
    expect(MinPokerPath.Lobby).toBe('lobby');
  });

  it('should configure the home route', async () => {
    const route = MINPOKER_ROUTES[0];
    const component = await route.loadComponent?.();

    expect(route.path).toBe(MinPokerPath.Root);
    expect(component).toBe(MinPokerHomeComponent);
  });

  it('should configure the game route with leave guard', async () => {
    const route = MINPOKER_ROUTES[1];
    const component = await route.loadComponent?.();

    expect(route.path).toBe(`${MinPokerPath.Game}/:id`);
    expect(route.canDeactivate).toEqual([leaveGameGuard]);
    expect(component).toBe(MinPokerGameComponent);
  });

  it('should configure the lobby route', async () => {
    const route = MINPOKER_ROUTES[2];
    const component = await route.loadComponent?.();

    expect(route.path).toBe(MinPokerPath.Lobby);
    expect(component).toBe(MinPokerLobbyComponent);
  });
});
