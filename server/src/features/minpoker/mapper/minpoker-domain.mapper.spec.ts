import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerGameDto } from '../models/dtos/minpoker-game.dto';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';
import { MinPokerDomainMapper } from './minpoker-domain.mapper';

describe('MinPokerDomainMapper', () => {
  describe('domainToDto()', () => {
    it('should map domain to DTO', () => {
      const domain = new MinPokerGame();
      domain.id = 'test-id';
      domain.name = 'Test Table';
      domain.createdAt = new Date('2025-01-01');
      domain.players = [{ id: 'p1', name: 'A' } as any];

      const dto: MinPokerGameDto = MinPokerDomainMapper.domainToDto(domain);

      expect(dto.id).toBe('test-id');
      expect(dto.name).toBe('Test Table');
      expect(dto.createdAt).toEqual(new Date('2025-01-01'));
      expect(dto.playerCount).toBe(1);
    });
  });

  describe('domainToEntity()', () => {
    it('should map domain to entity', () => {
      const domain = new MinPokerGame();
      domain.id = 'test-id';
      domain.name = 'Test Table';
      domain.createdAt = new Date('2025-01-01');
      domain.tableSize = 6;

      const entity: MinPokerGameEntity = MinPokerDomainMapper.domainToEntity(domain);

      expect(entity.id).toBe('test-id');
      expect(entity.name).toBe('Test Table');
      expect(entity.createdAt).toEqual(new Date('2025-01-01'));
      expect(entity.tableSize).toBe(6);
    });
  });
});
