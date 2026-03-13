import { MinRpsEntityMapper } from './minrps-entity.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';

describe('MinRpsEntityMapper', () => {
  describe('entityToDomain', () => {
    it('should map entity to domain', () => {
      const entity = new MinRpsGameEntity();
      entity.id = 'test-id';
      entity.name = 'Test Game';
      entity.createdAt = new Date('2024-01-01');

      const domain: MinRpsGame = MinRpsEntityMapper.entityToDomain(entity);

      expect(domain).toBeInstanceOf(MinRpsGame);
      expect(domain.id).toBe('test-id');
      expect(domain.name).toBe('Test Game');
      expect(domain.createdAt).toEqual(new Date('2024-01-01'));
    });

    it('should map entity with empty name', () => {
      const entity = new MinRpsGameEntity();
      entity.id = 'test-id';
      entity.name = '';
      entity.createdAt = new Date('2024-01-01');

      const domain: MinRpsGame = MinRpsEntityMapper.entityToDomain(entity);

      expect(domain.name).toBe('');
    });
  });
});
