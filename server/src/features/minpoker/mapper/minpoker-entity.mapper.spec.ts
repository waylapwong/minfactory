import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';
import { MinFactoryUserEntity } from '../../minfactory/models/entities/minfactory-user.entity';
import { MinPokerEntityMapper } from './minpoker-entity.mapper';

describe('MinPokerEntityMapper', () => {
  describe('toDomain()', () => {
    it('should map entity to domain', () => {
      const entity = new MinPokerGameEntity();
      entity.id = 'e1';
      entity.name = 'Table 1';
      entity.createdAt = new Date('2025-02-02');
      entity.creator = new MinFactoryUserEntity();
      entity.creator.id = 'creator-id';
      entity.bigBlind = 20;
      entity.smallBlind = 10;
      entity.tableSize = 9;
      entity.isPublic = true;

      const domain: MinPokerGame = MinPokerEntityMapper.toDomain(entity);

      expect(domain.id).toBe('e1');
      expect(domain.name).toBe('Table 1');
      expect(domain.createdAt).toEqual(new Date('2025-02-02'));
      expect(domain.creatorId).toBe('creator-id');
      expect(domain.bigBlind).toBe(20);
      expect(domain.smallBlind).toBe(10);
      expect(domain.tableSize).toBe(9);
      expect(domain.isPublic).toBe(true);
    });
  });
});
