import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerCreateGameDto } from '../models/dtos/minpoker-create-game.dto';
import { MinPokerDtoMapper } from './minpoker-dto.mapper';

describe('MinPokerDtoMapper', () => {
  describe('toDomain()', () => {
    it('should map create DTO to domain', () => {
      const dto = new MinPokerCreateGameDto();
      dto.name = 'New Table';
      dto.isPublic = true;

      const domain: MinPokerGame = MinPokerDtoMapper.toDomain(dto);

      expect(domain).toBeDefined();
      expect(domain.name).toBe('New Table');
      expect(domain.isPublic).toBe(true);
    });
  });
});
