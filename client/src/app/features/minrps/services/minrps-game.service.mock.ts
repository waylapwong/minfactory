export const MINRPS_GAME_SERVICE_MOCK = {
  setupNewGame: jasmine.createSpy('setupNewGame'),
  startGame: jasmine.createSpy('startGame').and.resolveTo(),
};
