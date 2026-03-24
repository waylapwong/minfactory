import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';
import { MinPokerEntityMapper } from './minpoker-entity.mapper';

describe('MinPokerEntityMapper', () => {
  describe('entityToDomain()', () => {
    it('should map entity to domain', () => {
      const entity = new MinPokerGameEntity();
      entity.id = 'e1';
      entity.name = 'Table 1';
      entity.createdAt = new Date('2025-02-02');
      entity.bigBlind = 2;
      entity.smallBlind = 1;

      const domain: MinPokerGame = MinPokerEntityMapper.entityToDomain(entity);

      expect(domain.id).toBe('e1');
      expect(domain.name).toBe('Table 1');
      expect(domain.createdAt).toEqual(new Date('2025-02-02'));
      expect(domain.bigBlind).toBe(2);
      expect(domain.smallBlind).toBe(1);
    });
  });
});
