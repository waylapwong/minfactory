import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsMatchRepository } from './minrps-match.repository';

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
  });

  describe('save', () => {
    it('should save a match to the map', () => {
      const game = new MinRpsGame();
      game.id = 'test-id';
      game.name = 'Test Game';

      repository.save(game);

      expect(repository.findOne('test-id')).toBe(game);
    });

    it('should overwrite existing match with same id', () => {
      const game1 = new MinRpsGame();
      game1.id = 'test-id';
      game1.name = 'Game 1';

      const game2 = new MinRpsGame();
      game2.id = 'test-id';
      game2.name = 'Game 2';

      repository.save(game1);
      repository.save(game2);

      expect(repository.findOne('test-id')).toBe(game2);
      expect(repository.findOne('test-id')?.name).toBe('Game 2');
    });
  });

  describe('findOne', () => {
    it('should return match when found', () => {
      const game = new MinRpsGame();
      game.id = 'test-id';
      game.name = 'Test Game';

      repository.save(game);

      const result = repository.findOne('test-id');

      expect(result).toBe(game);
    });

    it('should return null when match not found', () => {
      const result = repository.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a match from the map', () => {
      const game = new MinRpsGame();
      game.id = 'test-id';
      game.name = 'Test Game';

      repository.save(game);
      expect(repository.findOne('test-id')).toBe(game);

      repository.delete('test-id');

      expect(repository.findOne('test-id')).toBeNull();
    });

    it('should not throw when deleting non-existent match', () => {
      expect(() => {
        repository.delete('non-existent-id');
      }).not.toThrow();
    });
  });

  describe('findOrCreate', () => {
    it('should create a match when it does not exist', () => {
      const match = repository.findOrCreate('new-match');

      expect(match).toBeDefined();
      expect(match.id).toBe('new-match');
      expect(repository.findOne('new-match')).toBe(match);
    });

    it('should return existing match when it exists', () => {
      const game = new MinRpsGame();
      game.id = 'existing-match';
      repository.save(game);

      const match = repository.findOrCreate('existing-match');

      expect(match).toBe(game);
    });
  });
});
