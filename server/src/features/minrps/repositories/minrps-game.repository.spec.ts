import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { MinRpsGameRepository } from './minrps-game.repository';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';

describe('MinRpsGameRepository', () => {
  let repository: MinRpsGameRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<MinRpsGameEntity>>;

  beforeEach(async () => {
    mockTypeOrmRepository = {
      save: jest.fn(),
      delete: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinRpsGameRepository,
        {
          provide: getRepositoryToken(MinRpsGameEntity),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<MinRpsGameRepository>(MinRpsGameRepository);
  });

  describe('save', () => {
    it('should save entity and return it', async () => {
      const entity = new MinRpsGameEntity();
      entity.id = 'test-id';
      entity.name = 'Test Game';
      
      mockTypeOrmRepository.save.mockResolvedValue(entity);

      const result = await repository.save(entity);

      expect(result).toBe(entity);
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(entity);
    });
  });

  describe('findAll', () => {
    it('should return all entities ordered by createdAt DESC', async () => {
      const entities = [
        Object.assign(new MinRpsGameEntity(), { id: '1', name: 'Game 1' }),
        Object.assign(new MinRpsGameEntity(), { id: '2', name: 'Game 2' }),
      ];
      
      mockTypeOrmRepository.find.mockResolvedValue(entities);

      const result = await repository.findAll();

      expect(result).toBe(entities);
      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
    });
  });

  describe('findOne', () => {
    it('should return entity when found', async () => {
      const entity = new MinRpsGameEntity();
      entity.id = 'test-id';
      entity.name = 'Test Game';
      
      mockTypeOrmRepository.findOne.mockResolvedValue(entity);

      const result = await repository.findOne('test-id');

      expect(result).toBe(entity);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
    });

    it('should throw NotFoundException when entity not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      await expect(repository.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(repository.findOne('non-existent-id')).rejects.toThrow('minRPS game with ID non-existent-id not found');
    });
  });

  describe('delete', () => {
    it('should delete entity when found', async () => {
      const entity = new MinRpsGameEntity();
      entity.id = 'test-id';
      
      mockTypeOrmRepository.findOne.mockResolvedValue(entity);
      mockTypeOrmRepository.delete.mockResolvedValue({} as any);

      await repository.delete('test-id');

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith({ id: 'test-id' });
    });

    it('should throw NotFoundException when entity not found for deletion', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      await expect(repository.delete('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
