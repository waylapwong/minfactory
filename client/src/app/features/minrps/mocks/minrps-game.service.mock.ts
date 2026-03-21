import { signal } from '@angular/core';
import { MinRpsOverviewViewModel } from '../models/viewmodels/minrps-overview.viewmodel';

const gamesSignal = signal<MinRpsOverviewViewModel[]>([]);

export const MINRPS_GAME_SERVICE_MOCK = {
  setupNewGame: jasmine.createSpy('setupNewGame'),
  startGame: jasmine.createSpy('startGame').and.resolveTo(),
  gameExistByID: jasmine.createSpy('gameExistByID').and.resolveTo(true),
  createGame: jasmine.createSpy('createGame').and.resolveTo(),
  deleteGame: jasmine.createSpy('deleteGame').and.resolveTo(),
  refreshGames: jasmine.createSpy('refreshGames'),
  games: gamesSignal.asReadonly(),
};
