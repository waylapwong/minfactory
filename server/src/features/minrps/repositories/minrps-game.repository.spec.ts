import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { MinRpsGameRepository } from './minrps-game.repository';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';
import { MINRPS_GAME_TYPEORM_REPOSITORY_MOCK } from './minrps-game.typeorm-repository.mock';

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

  describe('save', () => {
    it('should save entity and return it', async () => {
      const entity = new MinRpsGameEntity();
      entity.id = 'test-id';
      entity.name = 'Test Game';

      MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.save.mockResolvedValue(entity);

      const result = await repository.save(entity);

      expect(result).toBe(entity);
      expect(MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.save).toHaveBeenCalledWith(entity);
    });
  });

  describe('findAll', () => {
    it('should return all entities ordered by createdAt DESC', async () => {
      const entities = [
        Object.assign(new MinRpsGameEntity(), { id: '1', name: 'Game 1' }),
        Object.assign(new MinRpsGameEntity(), { id: '2', name: 'Game 2' }),
      ];

      MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.find.mockResolvedValue(entities);

      const result = await repository.findAll();

      expect(result).toBe(entities);
      expect(MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
    });
  });

  describe('findOne', () => {
    it('should return entity when found', async () => {
      const entity = new MinRpsGameEntity();
      entity.id = 'test-id';
      entity.name = 'Test Game';

      MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.findOne.mockResolvedValue(entity);

      const result = await repository.findOne('test-id');

      expect(result).toBe(entity);
      expect(MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
    });

    it('should throw NotFoundException when entity not found', async () => {
      MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.findOne.mockResolvedValue(null);

      await expect(repository.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(repository.findOne('non-existent-id')).rejects.toThrow(
        'minRPS game with ID non-existent-id not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete entity when found', async () => {
      const entity = new MinRpsGameEntity();
      entity.id = 'test-id';

      MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.findOne.mockResolvedValue(entity);
      MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.delete.mockResolvedValue({} as any);

      await repository.delete('test-id');

      expect(MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
      expect(MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.delete).toHaveBeenCalledWith({ id: 'test-id' });
    });

    it('should throw NotFoundException when entity not found for deletion', async () => {
      MINRPS_GAME_TYPEORM_REPOSITORY_MOCK.findOne.mockResolvedValue(null);

      await expect(repository.delete('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
