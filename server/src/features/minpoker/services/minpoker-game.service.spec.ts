import { Test, TestingModule } from '@nestjs/testing';
import { MINPOKER_GAME_REPOSITORY_MOCK } from '../mocks/minpoker-game.repository.mock';
import { MinPokerCreateGameDto } from '../models/dtos/minpoker-create-game.dto';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';
import { MinPokerGameRepository } from '../repositories/minpoker-game.repository';
import { MinPokerGameService } from './minpoker-game.service';
import { MINFACTORY_USER_REPOSITORY_MOCK } from 'src/features/minfactory/mocks/minfactory-user.repository.mock';
import { MinFactoryUserRepository } from 'src/features/minfactory/repositories/minfactory-user.repository';
import { MinFactoryRole } from 'src/shared/enums/minfactory-role.enum';

describe('MinPokerGameService', () => {
  let service: MinPokerGameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinPokerGameService,
        { provide: MinPokerGameRepository, useValue: MINPOKER_GAME_REPOSITORY_MOCK },
        { provide: MinFactoryUserRepository, useValue: MINFACTORY_USER_REPOSITORY_MOCK },
      ],
    }).compile();
    service = module.get<MinPokerGameService>(MinPokerGameService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGame()', () => {
    it('should create and return a game dto', async () => {
      const createDto = new MinPokerCreateGameDto();
      createDto.name = 'Test Poker Table';
      const firebaseUser = { firebaseUid: 'fb-creator-1' } as any;

      const savedEntity = new MinPokerGameEntity();
      savedEntity.id = 'poker-id';
      savedEntity.name = 'Test Poker Table';
      savedEntity.createdAt = new Date();
      savedEntity.bigBlind = 2;
      savedEntity.smallBlind = 1;
      savedEntity.tableSize = 6;

      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue({ id: 'creator-1', role: MinFactoryRole.User });
      MINPOKER_GAME_REPOSITORY_MOCK.save.mockResolvedValue(savedEntity);

      const result = await service.createGame(createDto, firebaseUser);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Poker Table');
      expect(result.id).toBe('poker-id');
      expect(MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid).toHaveBeenCalledWith('fb-creator-1');
      expect(MINPOKER_GAME_REPOSITORY_MOCK.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Poker Table',
          creator: expect.objectContaining({ id: 'creator-1' }),
        }),
      );
    });
  });

  describe('getAllGames()', () => {
    it('should return only creator games for User role', async () => {
      const firebaseUser = { firebaseUid: 'fb-creator-1' } as any;
      const entities = [
        Object.assign(new MinPokerGameEntity(), { id: '1', name: 'Table 1', createdAt: new Date() }),
        Object.assign(new MinPokerGameEntity(), { id: '2', name: 'Table 2', createdAt: new Date() }),
      ];

      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue({ id: 'creator-1', role: MinFactoryRole.User });
      MINPOKER_GAME_REPOSITORY_MOCK.findAllByCreator.mockResolvedValue(entities);

      const result = await service.getAllGames(firebaseUser);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Table 1');
      expect(MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid).toHaveBeenCalledWith('fb-creator-1');
      expect(MINPOKER_GAME_REPOSITORY_MOCK.findAllByCreator).toHaveBeenCalledWith('creator-1');
      expect(MINPOKER_GAME_REPOSITORY_MOCK.findAll).not.toHaveBeenCalled();
    });

    it('should return all games for Admin role', async () => {
      const firebaseUser = { firebaseUid: 'fb-admin-1' } as any;
      const entities = [
        Object.assign(new MinPokerGameEntity(), { id: '1', name: 'Table 1', createdAt: new Date() }),
        Object.assign(new MinPokerGameEntity(), { id: '2', name: 'Table 2', createdAt: new Date() }),
        Object.assign(new MinPokerGameEntity(), { id: '3', name: 'Table 3', createdAt: new Date() }),
      ];

      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue({ id: 'admin-1', role: MinFactoryRole.Admin });
      MINPOKER_GAME_REPOSITORY_MOCK.findAll.mockResolvedValue(entities);

      const result = await service.getAllGames(firebaseUser);

      expect(result).toHaveLength(3);
      expect(MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid).toHaveBeenCalledWith('fb-admin-1');
      expect(MINPOKER_GAME_REPOSITORY_MOCK.findAll).toHaveBeenCalled();
      expect(MINPOKER_GAME_REPOSITORY_MOCK.findAllByCreator).not.toHaveBeenCalled();
    });
  });

  describe('deleteGame()', () => {
    it('should delete a game by id when user is the creator', async () => {
      const firebaseUser = { firebaseUid: 'fb-creator-1' } as any;
      const userEntity = { id: 'creator-1', role: MinFactoryRole.User };
      const gameEntity = Object.assign(new MinPokerGameEntity(), {
        id: 'game-id',
        name: 'Test Table',
        creator: userEntity,
      });

      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue(userEntity);
      MINPOKER_GAME_REPOSITORY_MOCK.findOne.mockResolvedValue(gameEntity);
      MINPOKER_GAME_REPOSITORY_MOCK.delete.mockResolvedValue(undefined);

      await service.deleteGame('game-id', firebaseUser);

      expect(MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid).toHaveBeenCalledWith('fb-creator-1');
      expect(MINPOKER_GAME_REPOSITORY_MOCK.findOne).toHaveBeenCalledWith('game-id');
      expect(MINPOKER_GAME_REPOSITORY_MOCK.delete).toHaveBeenCalledWith('game-id');
    });

    it('should throw ForbiddenException when user is not the creator', async () => {
      const firebaseUser = { firebaseUid: 'fb-user-2' } as any;
      const userEntity = { id: 'user-2', role: MinFactoryRole.User };
      const creatorEntity = { id: 'creator-1' };
      const gameEntity = Object.assign(new MinPokerGameEntity(), {
        id: 'game-id',
        name: 'Test Table',
        creator: creatorEntity,
      });

      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue(userEntity);
      MINPOKER_GAME_REPOSITORY_MOCK.findOne.mockResolvedValue(gameEntity);

      await expect(service.deleteGame('game-id', firebaseUser)).rejects.toThrow(
        'You are not authorized to delete this game',
      );

      expect(MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid).toHaveBeenCalledWith('fb-user-2');
      expect(MINPOKER_GAME_REPOSITORY_MOCK.findOne).toHaveBeenCalledWith('game-id');
      expect(MINPOKER_GAME_REPOSITORY_MOCK.delete).not.toHaveBeenCalled();
    });

    it('should allow Admin to delete any game regardless of ownership', async () => {
      const firebaseUser = { firebaseUid: 'fb-admin-1' } as any;
      const adminEntity = { id: 'admin-1', role: MinFactoryRole.Admin };
      const creatorEntity = { id: 'creator-1' };
      const gameEntity = Object.assign(new MinPokerGameEntity(), {
        id: 'game-id',
        name: 'Test Table',
        creator: creatorEntity,
      });

      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue(adminEntity);
      MINPOKER_GAME_REPOSITORY_MOCK.findOne.mockResolvedValue(gameEntity);
      MINPOKER_GAME_REPOSITORY_MOCK.delete.mockResolvedValue(undefined);

      await service.deleteGame('game-id', firebaseUser);

      expect(MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid).toHaveBeenCalledWith('fb-admin-1');
      expect(MINPOKER_GAME_REPOSITORY_MOCK.findOne).toHaveBeenCalledWith('game-id');
      expect(MINPOKER_GAME_REPOSITORY_MOCK.delete).toHaveBeenCalledWith('game-id');
    });
  });
});
