import { MinRpsGameDto } from '../../../core/generated';
import { MinRpsDtoMapper } from './minrps-dto.mapper';

describe('MinRpsDtoMapper', () => {
  describe('dtoToDomain', () => {
    it('should map all supported fields from dto to domain', () => {
      const dto: MinRpsGameDto = {
        createdAt: '2024-01-01T12:00:00.000Z',
        id: 'game-123',
        name: 'Lobby A',
        observerCount: 4,
        playerCount: 2,
      };

      const result = MinRpsDtoMapper.dtoToDomain(dto);

      expect(result.createdAt.getTime()).toBe(new Date(dto.createdAt).getTime());
      expect(result.id).toBe(dto.id);
      expect(result.name).toBe(dto.name);
      expect(result.observerCount).toBe(dto.observerCount);
      expect(result.playerCount).toBe(dto.playerCount);
    });

    it('should return a new domain instance', () => {
      const dto: MinRpsGameDto = {
        createdAt: '2024-01-01T12:00:00.000Z',
        id: 'game-123',
        name: 'Lobby A',
        observerCount: 4,
        playerCount: 2,
      };

      const result = MinRpsDtoMapper.dtoToDomain(dto);

      expect(result === (dto as unknown as typeof result)).toBeFalse();
    });

    it('should create a new date instance from createdAt', () => {
      const dto: MinRpsGameDto = {
        createdAt: '2024-01-01T12:00:00.000Z',
        id: 'game-123',
        name: 'Lobby A',
        observerCount: 4,
        playerCount: 2,
      };

      const result = MinRpsDtoMapper.dtoToDomain(dto);

      expect(result.createdAt).not.toBe(dto.createdAt as unknown as Date);
      expect(result.createdAt.getTime()).toBe(new Date(dto.createdAt).getTime());
    });
  });
});
