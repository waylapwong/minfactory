import { signal } from '@angular/core';
import { MinPokerGameViewModel } from '../models/viewmodels/minpoker-game.viewmodel';

export const MINPOKER_MULTIPLAYER_GAME_SIGNAL = signal(new MinPokerGameViewModel());
export const MINPOKER_MULTIPLAYER_PLAYER_ID_SIGNAL = signal('');
export const MINPOKER_MULTIPLAYER_SERVICE_MOCK = {
  connect: jasmine.createSpy('connect'),
  disconnect: jasmine.createSpy('disconnect'),
  game: MINPOKER_MULTIPLAYER_GAME_SIGNAL.asReadonly(),
  playerId: MINPOKER_MULTIPLAYER_PLAYER_ID_SIGNAL.asReadonly(),
  seatGame: jasmine.createSpy('seatGame'),
  setGameId: jasmine.createSpy('setGameId'),
};
