import { signal } from '@angular/core';
import { MinRpsMultiplayerViewModel } from '../models/viewmodels/minrps-multiplayer.viewmodel';

const createInitialViewModel = (): MinRpsMultiplayerViewModel => {
  const vm = new MinRpsMultiplayerViewModel();
  vm.gameId = 'test-id';
  return vm;
};

const gameSignal = signal(createInitialViewModel());

export const MINRPS_MULTIPLAYER_SERVICE_MOCK = {
  connect: jasmine.createSpy('connect'),
  disconnect: jasmine.createSpy('disconnect'),
  joinGame: jasmine.createSpy('joinGame'),
  leaveGame: jasmine.createSpy('leaveGame'),
  seatGame: jasmine.createSpy('seatGame'),
  selectMove: jasmine.createSpy('selectMove'),
  setGameId: jasmine.createSpy('setGameId'),
  playGame: jasmine.createSpy('playGame'),
  game: gameSignal,
};
