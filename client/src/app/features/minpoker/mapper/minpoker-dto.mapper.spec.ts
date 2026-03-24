import { MinPokerGameDto } from '../../../core/generated';
import { MinPokerDtoMapper } from './minpoker-dto.mapper';

describe('MinPokerDtoMapper', () => {
  describe('gameDtoToDomain()', () => {
    it('should map game DTO to domain', () => {
      const dto: MinPokerGameDto = {
        bigBlind: 100,
        createdAt: '2026-01-01T18:00:00.000Z',
        id: 'game-id',
        maxPlayerCount: 6,
        name: 'Evening Table',
        observerCount: 2,
        playerCount: 4,
        smallBlind: 50,
      };

      const domain = MinPokerDtoMapper.gameDtoToDomain(dto);

      expect(domain.id).toBe('game-id');
      expect(domain.name).toBe('Evening Table');
      expect(domain.createdAt).toEqual(new Date('2026-01-01T18:00:00.000Z'));
      expect(domain.playerCount).toBe(4);
      expect(domain.observerCount).toBe(2);
      expect(domain.smallBlind).toBe(50);
      expect(domain.bigBlind).toBe(100);
    });
  });
});
