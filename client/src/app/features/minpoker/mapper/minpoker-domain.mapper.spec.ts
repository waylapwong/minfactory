import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerDomainMapper } from './minpoker-domain.mapper';

describe('MinPokerDomainMapper', () => {
  describe('domainToLobbyViewModel()', () => {
    it('should map domain to lobby view model', () => {
      const domain = new MinPokerGame();
      domain.bigBlind = 100;
      domain.createdAt = new Date('2026-01-01T18:00:00.000Z');
      domain.id = 'game-id';
      domain.maxPlayerCount = 9;
      domain.name = 'Evening Table';
      domain.observerCount = 2;
      domain.playerCount = 4;
      domain.smallBlind = 50;

      const viewModel = MinPokerDomainMapper.domainToLobbyViewModel(domain);

      expect(viewModel.id).toBe('game-id');
      expect(viewModel.name).toBe('Evening Table');
      expect(viewModel.createdAt).toEqual(new Date('2026-01-01T18:00:00.000Z'));
      expect(viewModel.maxPlayerCount).toBe(9);
      expect(viewModel.playerCount).toBe(4);
      expect(viewModel.observerCount).toBe(2);
      expect(viewModel.smallBlind).toBe(50);
      expect(viewModel.bigBlind).toBe(100);
    });
  });
});
