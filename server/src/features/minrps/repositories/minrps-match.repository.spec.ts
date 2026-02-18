import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsMatchRepository } from './minrps-match.repository';
import { MinRpsGame } from '../models/domains/minrps-game';

describe('MinRpsMatchRepository', () => {
  let repository: MinRpsMatchRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinRpsMatchRepository],
    }).compile();

    repository = module.get<MinRpsMatchRepository>(MinRpsMatchRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(repository.matches).toBeInstanceOf(Map);
  });

  describe('save', () => {
    it('should save a match to the map', () => {
      const game = new MinRpsGame();
      game.id = 'test-id';
      game.name = 'Test Game';

      repository.save('test-id', game);

      expect(repository.matches.get('test-id')).toBe(game);
    });

    it('should overwrite existing match with same id', () => {
      const game1 = new MinRpsGame();
      game1.id = 'test-id';
      game1.name = 'Game 1';

      const game2 = new MinRpsGame();
      game2.id = 'test-id';
      game2.name = 'Game 2';

      repository.save('test-id', game1);
      repository.save('test-id', game2);

      expect(repository.matches.get('test-id')).toBe(game2);
      expect(repository.matches.get('test-id')?.name).toBe('Game 2');
    });
  });

  describe('findById', () => {
    it('should return match when found', () => {
      const game = new MinRpsGame();
      game.id = 'test-id';
      game.name = 'Test Game';

      repository.save('test-id', game);

      const result = repository.findById('test-id');

      expect(result).toBe(game);
    });

    it('should return undefined when match not found', () => {
      const result = repository.findById('non-existent-id');

      expect(result).toBeUndefined();
    });
  });
});
