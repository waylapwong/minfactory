import { MinRpsDtoMapper } from './minrps-dto.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsCreateGameDto } from '../models/dtos/minrps-create-game.dto';
import { MinRpsPlayDto } from '../models/dtos/minrps-play.dto';
import { MinRpsMove } from '../models/enums/minrps-move.enum';

describe('MinRpsDtoMapper', () => {
  describe('createDtoToDomain', () => {
    it('should map create DTO to domain', () => {
      const dto = new MinRpsCreateGameDto();
      dto.name = 'Test Game';

      const domain: MinRpsGame = MinRpsDtoMapper.createDtoToDomain(dto);

      expect(domain).toBeInstanceOf(MinRpsGame);
      expect(domain.name).toBe('Test Game');
    });

    it('should create new domain with empty name', () => {
      const dto = new MinRpsCreateGameDto();
      dto.name = '';

      const domain: MinRpsGame = MinRpsDtoMapper.createDtoToDomain(dto);

      expect(domain).toBeInstanceOf(MinRpsGame);
      expect(domain.name).toBe('');
    });
  });

  describe('playDtoToDomain', () => {
    it('should map play DTO to domain with Rock move', () => {
      const dto = new MinRpsPlayDto();
      dto.player1Move = MinRpsMove.Rock;

      const domain: MinRpsGame = MinRpsDtoMapper.playDtoToDomain(dto);

      expect(domain).toBeInstanceOf(MinRpsGame);
      expect(domain.player1).toBeDefined();
      expect(domain.player1.move).toBe(MinRpsMove.Rock);
    });

    it('should map play DTO to domain with Paper move', () => {
      const dto = new MinRpsPlayDto();
      dto.player1Move = MinRpsMove.Paper;

      const domain: MinRpsGame = MinRpsDtoMapper.playDtoToDomain(dto);

      expect(domain.player1.move).toBe(MinRpsMove.Paper);
    });

    it('should map play DTO to domain with Scissors move', () => {
      const dto = new MinRpsPlayDto();
      dto.player1Move = MinRpsMove.Scissors;

      const domain: MinRpsGame = MinRpsDtoMapper.playDtoToDomain(dto);

      expect(domain.player1.move).toBe(MinRpsMove.Scissors);
    });
  });
});
