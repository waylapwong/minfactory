import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MINPOKER_GAME_TYPEORM_REPOSITORY_MOCK } from '../mocks/minpoker-game.typeorm-repository.mock';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';
import { MinPokerGameRepository } from './minpoker-game.repository';

describe('MinPokerGameRepository', () => {
  let repository: MinPokerGameRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinPokerGameRepository,
        {
          provide: getRepositoryToken(MinPokerGameEntity),
          useValue: MINPOKER_GAME_TYPEORM_REPOSITORY_MOCK,
        },
      ],
    }).compile();

    repository = module.get<MinPokerGameRepository>(MinPokerGameRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save()', () => {
    it('should save entity and return it', async () => {
      const entity = new MinPokerGameEntity();
      entity.id = 'test-id';
      entity.name = 'Test Table';

      MINPOKER_GAME_TYPEORM_REPOSITORY_MOCK.save.mockResolvedValue(entity);

      const result = await repository.save(entity);

      expect(result).toBe(entity);
      expect(MINPOKER_GAME_TYPEORM_REPOSITORY_MOCK.save).toHaveBeenCalledWith(entity);
    });
  });

  describe('findAll()', () => {
    it('should return all entities ordered by createdAt DESC', async () => {
      const entities = [
        Object.assign(new MinPokerGameEntity(), { id: '1', name: 'Table 1' }),
        Object.assign(new MinPokerGameEntity(), { id: '2', name: 'Table 2' }),
      ];

      MINPOKER_GAME_TYPEORM_REPOSITORY_MOCK.find.mockResolvedValue(entities);

      const result = await repository.findAll();

      expect(result).toBe(entities);
      expect(MINPOKER_GAME_TYPEORM_REPOSITORY_MOCK.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
    });
  });

  describe('findOne()', () => {
    it('should return entity when found', async () => {
      const entity = new MinPokerGameEntity();
      entity.id = 'test-id';
      entity.name = 'Test Table';

      MINPOKER_GAME_TYPEORM_REPOSITORY_MOCK.findOne.mockResolvedValue(entity);

      const result = await repository.findOne('test-id');

      expect(result).toBe(entity);
      expect(MINPOKER_GAME_TYPEORM_REPOSITORY_MOCK.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
    });

    it('should throw NotFoundException when entity not found', async () => {
      MINPOKER_GAME_TYPEORM_REPOSITORY_MOCK.findOne.mockResolvedValue(null);

      await expect(repository.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(repository.findOne('non-existent-id')).rejects.toThrow(
        'minPoker game with ID non-existent-id not found',
      );
    });
  });

  describe('delete()', () => {
    it('should delete entity when found', async () => {
      const entity = new MinPokerGameEntity();
      entity.id = 'test-id';

      MINPOKER_GAME_TYPEORM_REPOSITORY_MOCK.findOne.mockResolvedValue(entity);
      MINPOKER_GAME_TYPEORM_REPOSITORY_MOCK.delete.mockResolvedValue({} as any);

      await repository.delete('test-id');

      expect(MINPOKER_GAME_TYPEORM_REPOSITORY_MOCK.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
      expect(MINPOKER_GAME_TYPEORM_REPOSITORY_MOCK.delete).toHaveBeenCalledWith({ id: 'test-id' });
    });

    it('should throw NotFoundException when entity not found for deletion', async () => {
      MINPOKER_GAME_TYPEORM_REPOSITORY_MOCK.findOne.mockResolvedValue(null);

      await expect(repository.delete('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
