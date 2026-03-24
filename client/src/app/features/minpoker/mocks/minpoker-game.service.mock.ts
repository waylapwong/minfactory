import { signal } from '@angular/core';
import { MinPokerLobbyViewModel } from '../models/viewmodels/minpoker-lobby.viewmodel';

const gamesSignal = signal<MinPokerLobbyViewModel[]>([]);

export const MINPOKER_GAME_SERVICE_MOCK = {
  refreshGames: jasmine.createSpy('refreshGames'),
  games: gamesSignal.asReadonly(),
};
