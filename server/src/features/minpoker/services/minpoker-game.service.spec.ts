import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationService } from '@nestjs/authorization';
import { MinFactoryRole } from '../../../shared/enums/minfactory-role.enum';
import { MinFactoryUser } from '../../minfactory/models/domains/minfactory-user';
import { AUTHORIZATION_SERVICE_MOCK } from '../mocks/authorization.service.mock';
import { MINPOKER_GAME_REPOSITORY_MOCK } from '../mocks/minpoker-game.repository.mock';
import { MinPokerCreateGameDto } from '../models/dtos/minpoker-create-game.dto';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';
import { MinPokerGameVisibility } from '../models/enums/minpoker-game-visibility.enum';
import { MinPokerGameRepository } from '../repositories/minpoker-game.repository';
import { MinPokerGamePolicy } from '../policies/minpoker-game.policy';
import { MinPokerGameService } from './minpoker-game.service';

describe('MinPokerGameService', () => {
  let service: MinPokerGameService;

  beforeEach(async () => {
    AUTHORIZATION_SERVICE_MOCK.authorize.mockResolvedValue(undefined);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinPokerGameService,
        { provide: MinPokerGameRepository, useValue: MINPOKER_GAME_REPOSITORY_MOCK },
        { provide: AuthorizationService, useValue: AUTHORIZATION_SERVICE_MOCK },
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
      createDto.visibility = MinPokerGameVisibility.Private;
      const user = Object.assign(new MinFactoryUser(), { id: 'creator-1', role: MinFactoryRole.User });

      const savedEntity = new MinPokerGameEntity();
      savedEntity.id = 'poker-id';
      savedEntity.name = 'Test Poker Table';
      savedEntity.visibility = MinPokerGameVisibility.Private;
      savedEntity.createdAt = new Date();
      savedEntity.bigBlind = 2;
      savedEntity.smallBlind = 1;
      savedEntity.tableSize = 6;
      savedEntity.creator = { id: 'creator-1' } as any;

      MINPOKER_GAME_REPOSITORY_MOCK.save.mockResolvedValue(savedEntity);

      const result = await service.createGame(createDto, user, 'test-request-id');

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Poker Table');
      expect(result.id).toBe('poker-id');
      expect(result.visibility).toBe(MinPokerGameVisibility.Private);
      expect(AUTHORIZATION_SERVICE_MOCK.authorize).not.toHaveBeenCalled();
      expect(MINPOKER_GAME_REPOSITORY_MOCK.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Poker Table',
          visibility: MinPokerGameVisibility.Private,
          creator: expect.objectContaining({ id: 'creator-1' }),
        }),
        'test-request-id',
      );
    });
  });

  describe('getAllGames()', () => {
    it('should return only own games when no visibility parameter is given', async () => {
      const user = Object.assign(new MinFactoryUser(), { id: 'creator-1', role: MinFactoryRole.User });
      const entities = [
        Object.assign(new MinPokerGameEntity(), {
          id: '1',
          name: 'Table 1',
          createdAt: new Date(),
          isPublic: false,
          creator: { id: 'creator-1' },
        }),
        Object.assign(new MinPokerGameEntity(), {
          id: '2',
          name: 'Table 2',
          createdAt: new Date(),
          isPublic: false,
          creator: { id: 'creator-1' },
        }),
      ];

      MINPOKER_GAME_REPOSITORY_MOCK.findAllByCreator.mockResolvedValue(entities);

      const result = await service.getAllGames(user, undefined as any, 'test-request-id');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Table 1');
      expect(MINPOKER_GAME_REPOSITORY_MOCK.findAllByCreator).toHaveBeenCalledWith('creator-1', 'test-request-id');
      expect(MINPOKER_GAME_REPOSITORY_MOCK.findAllPublic).not.toHaveBeenCalled();
    });

    it('should return public games when visibility=public', async () => {
      const user = new MinFactoryUser();
      const entities = [
        Object.assign(new MinPokerGameEntity(), {
          id: '1',
          name: 'Public Table 1',
          createdAt: new Date(),
          isPublic: true,
          creator: { id: 'creator-1' },
        }),
        Object.assign(new MinPokerGameEntity(), {
          id: '2',
          name: 'Public Table 2',
          createdAt: new Date(),
          isPublic: true,
          creator: { id: 'creator-1' },
        }),
        Object.assign(new MinPokerGameEntity(), {
          id: '3',
          name: 'Public Table 3',
          createdAt: new Date(),
          isPublic: true,
          creator: { id: 'creator-1' },
        }),
      ];

      MINPOKER_GAME_REPOSITORY_MOCK.findAllPublic.mockResolvedValue(entities);

      const result = await service.getAllGames(user, MinPokerGameVisibility.Public, 'test-request-id');

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Public Table 1');
      expect(MINPOKER_GAME_REPOSITORY_MOCK.findAllPublic).toHaveBeenCalledWith('test-request-id');
      expect(MINPOKER_GAME_REPOSITORY_MOCK.findAllByCreator).not.toHaveBeenCalled();
    });
  });

  describe('deleteGame()', () => {
    it('should delete a game by id when user is the creator', async () => {
      const user = Object.assign(new MinFactoryUser(), { id: 'creator-1', role: MinFactoryRole.User });
      const gameEntity = Object.assign(new MinPokerGameEntity(), {
        id: 'game-id',
        name: 'Test Table',
        creator: user,
      });

      MINPOKER_GAME_REPOSITORY_MOCK.findOne.mockResolvedValue(gameEntity);
      MINPOKER_GAME_REPOSITORY_MOCK.delete.mockResolvedValue(undefined);

      await service.deleteGame('game-id', user, 'test-request-id');

      expect(MINPOKER_GAME_REPOSITORY_MOCK.findOne).toHaveBeenCalledWith('game-id', 'test-request-id');
      expect(AUTHORIZATION_SERVICE_MOCK.authorize).toHaveBeenCalledWith(MinPokerGamePolicy, 'delete', user, 'creator-1');
      expect(MINPOKER_GAME_REPOSITORY_MOCK.delete).toHaveBeenCalledWith('game-id', 'test-request-id');
    });

    it('should throw ForbiddenException when user is not the creator', async () => {
      const user = Object.assign(new MinFactoryUser(), { id: 'user-2', role: MinFactoryRole.User });
      const creatorEntity = { id: 'creator-1' };
      const gameEntity = Object.assign(new MinPokerGameEntity(), {
        id: 'game-id',
        name: 'Test Table',
        creator: creatorEntity,
      });

      MINPOKER_GAME_REPOSITORY_MOCK.findOne.mockResolvedValue(gameEntity);
      AUTHORIZATION_SERVICE_MOCK.authorize.mockRejectedValue(new Error('Forbidden'));

      await expect(service.deleteGame('game-id', user, 'test-request-id')).rejects.toThrow('Forbidden');

      expect(MINPOKER_GAME_REPOSITORY_MOCK.findOne).toHaveBeenCalledWith('game-id', 'test-request-id');
      expect(AUTHORIZATION_SERVICE_MOCK.authorize).toHaveBeenCalledWith(MinPokerGamePolicy, 'delete', user, 'creator-1');
      expect(MINPOKER_GAME_REPOSITORY_MOCK.delete).not.toHaveBeenCalled();
    });

    it('should allow Admin to delete any game regardless of ownership', async () => {
      const admin = Object.assign(new MinFactoryUser(), { id: 'admin-1', role: MinFactoryRole.Admin });
      const creatorEntity = { id: 'creator-1' };
      const gameEntity = Object.assign(new MinPokerGameEntity(), {
        id: 'game-id',
        name: 'Test Table',
        creator: creatorEntity,
      });

      MINPOKER_GAME_REPOSITORY_MOCK.findOne.mockResolvedValue(gameEntity);
      MINPOKER_GAME_REPOSITORY_MOCK.delete.mockResolvedValue(undefined);

      await service.deleteGame('game-id', admin, 'test-request-id');

      expect(MINPOKER_GAME_REPOSITORY_MOCK.findOne).toHaveBeenCalledWith('game-id', 'test-request-id');
      expect(AUTHORIZATION_SERVICE_MOCK.authorize).toHaveBeenCalledWith(MinPokerGamePolicy, 'delete', admin, 'creator-1');
      expect(MINPOKER_GAME_REPOSITORY_MOCK.delete).toHaveBeenCalledWith('game-id', 'test-request-id');
    });
  });
});
