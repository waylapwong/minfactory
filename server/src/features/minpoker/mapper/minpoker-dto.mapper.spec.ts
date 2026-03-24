import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerCreateGameDto } from '../models/dtos/minpoker-create-game.dto';
import { MinPokerDtoMapper } from './minpoker-dto.mapper';

describe('MinPokerDtoMapper', () => {
  describe('createDtoToDomain()', () => {
    it('should map create DTO to domain', () => {
      const dto = new MinPokerCreateGameDto();
      dto.name = 'New Table';

      const domain: MinPokerGame = MinPokerDtoMapper.createDtoToDomain(dto);

      expect(domain).toBeDefined();
      expect(domain.name).toBe('New Table');
    });
  });
});
