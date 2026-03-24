import { signal } from '@angular/core';
import { MinPokerLobbyViewModel } from '../models/viewmodels/minpoker-lobby.viewmodel';

const gamesSignal = signal<MinPokerLobbyViewModel[]>([]);

export const MINPOKER_GAME_SERVICE_MOCK = {
  loadGames: jasmine.createSpy('loadGames').and.resolveTo(),
  lobbyViewModels: gamesSignal.asReadonly(),
  games: gamesSignal.asReadonly(),
  createGame: jasmine.createSpy('createGame').and.resolveTo(),
};
