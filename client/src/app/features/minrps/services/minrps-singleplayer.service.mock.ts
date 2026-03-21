import { signal } from '@angular/core';
import { MinRpsSingleplayerViewModel } from '../models/viewmodels/minrps-singleplayer.viewmodel';

const gameSignal = signal(new MinRpsSingleplayerViewModel());

export const MINRPS_SINGLEPLAYER_SERVICE_MOCK = {
  playGame: jasmine.createSpy('playGame'),
  selectMove: jasmine.createSpy('selectMove'),
  setupNewGame: jasmine.createSpy('setupNewGame'),
  game: gameSignal.asReadonly(),
};
