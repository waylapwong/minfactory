import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsDomainMapper } from './minrps-domain.mapper';

describe('MinRpsDomainMapper', () => {
  describe('domainToViewModel', () => {
    it('should map all supported fields from domain to view model', () => {
      const domain = new MinRpsGame({
        createdAt: new Date('2024-01-01T12:00:00.000Z'),
        id: 'game-123',
        name: 'Lobby A',
        observerCount: 4,
        playerCount: 2,
      });

      const result = MinRpsDomainMapper.domainToViewModel(domain);

      expect(result.createdAt).toBe(domain.createdAt);
      expect(result.id).toBe(domain.id);
      expect(result.name).toBe(domain.name);
      expect(result.observerCount).toBe(domain.observerCount);
      expect(result.playerCount).toBe(domain.playerCount);
    });

    it('should return a new view model instance', () => {
      const domain = new MinRpsGame({
        createdAt: new Date('2024-01-01T12:00:00.000Z'),
        id: 'game-123',
        name: 'Lobby A',
        observerCount: 4,
        playerCount: 2,
      });

      const result = MinRpsDomainMapper.domainToViewModel(domain);

      expect(result === (domain as unknown as typeof result)).toBeFalse();
    });

    it('should keep the same createdAt reference (no date clone)', () => {
      const domain = new MinRpsGame({
        createdAt: new Date('2024-01-01T12:00:00.000Z'),
        id: 'game-123',
        name: 'Lobby A',
        observerCount: 4,
        playerCount: 2,
      });

      const result = MinRpsDomainMapper.domainToViewModel(domain);

      expect(result.createdAt).toBe(domain.createdAt);
    });
  });
});
