import { signal } from '@angular/core';
import { MinPokerPublicGamesVm } from '../models/viewmodels/minpoker-public-games.vm';

const myGamesVmSignal = signal<MinPokerPublicGamesVm>(new MinPokerPublicGamesVm());
const publicGamesVmSignal = signal<MinPokerPublicGamesVm>(new MinPokerPublicGamesVm());

export const MINPOKER_GAME_SERVICE_MOCK = {
  loadGames: jasmine.createSpy('loadGames').and.resolveTo(),
  myGamesVm: myGamesVmSignal.asReadonly(),
  publicGamesVm: publicGamesVmSignal.asReadonly(),
  createGame: jasmine.createSpy('createGame').and.resolveTo(),
  deleteGame: jasmine.createSpy('deleteGame').and.resolveTo(),
};
