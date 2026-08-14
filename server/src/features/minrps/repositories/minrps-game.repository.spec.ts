import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MINRPS_GAME_TYPEORM_REPOSITORY_MOCK } from '../mocks/minrps-game.typeorm-repository.mock';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';
import { MinRpsGameRepository } from './minrps-game.repository';

describe('MinRpsGameRepository', () => {
  let repository: MinRpsGameRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinRpsGameRepository,
        {
          provide: getRepositoryToken(MinRpsGameEntity),
          useValue: MINRPS_GAME_TYPEORM_REPOSITORY_MOCK,
        },
      ],
    }).compile();

    repository = module.get<MinRpsGameRepository>(MinRpsGameRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save()', () => {
    it('should save entity and return it', async () => {
      const entity = new MinRpsGameEntity();
      entity.id = 'test-id';
      entity.name = 'Test Game';

      MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.save.mockResolvedValue(entity);

      const result = await repository.save(entity, 'test-request-id');

      expect(result).toBe(entity);
      expect(MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.save).toHaveBeenCalledWith(entity);
    });
  });

  describe('findAll()', () => {
    it('should return all entities ordered by createdAt DESC', async () => {
      const entities = [
        Object.assign(new MinRpsGameEntity(), { id: '1', name: 'Game 1' }),
        Object.assign(new MinRpsGameEntity(), { id: '2', name: 'Game 2' }),
      ];

      MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.find.mockResolvedValue(entities);

      const result = await repository.findAll('test-request-id');

      expect(result).toBe(entities);
      expect(MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne()', () => {
    it('should return entity when found', async () => {
      const entity = new MinRpsGameEntity();
      entity.id = 'test-id';
      entity.name = 'Test Game';

      MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.findOne.mockResolvedValue(entity);

      const result = await repository.findOne('test-id', 'test-request-id');

      expect(result).toBe(entity);
      expect(MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });

    it('should return null when entity not found', async () => {
      MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.findOne.mockResolvedValue(null);

      await expect(repository.findOne('non-existent-id', 'test-request-id')).resolves.toBeNull();
    });
  });

  describe('delete()', () => {
    it('should delete entity when found', async () => {
      MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await repository.delete('test-id', 'test-request-id');

      expect(result).toBe(true);
      expect(MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.delete).toHaveBeenCalledWith({ id: 'test-id' });
    });

    it('should not throw when entity not found for deletion', async () => {
      MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.delete.mockResolvedValue({ affected: 0 } as any);

      await expect(repository.delete('non-existent-id', 'test-request-id')).resolves.toBe(false);
      expect(MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.delete).toHaveBeenCalledWith({ id: 'non-existent-id' });
    });
  });
});
