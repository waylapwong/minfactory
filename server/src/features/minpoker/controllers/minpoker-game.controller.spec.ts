import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationModule } from '@nestjs/authorization';
import { FirebaseGuard } from '../../../core/authentication/guards/firebase.guard';
import { AUTHENTICATION_GUARD_MOCK } from '../../../core/authentication/mocks/authentication.guard.mock';
import { AUTHENTICATION_SERVICE_MOCK } from '../../../core/authentication/mocks/authentication.service.mock';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { MinFactoryRole } from '../../../shared/enums/minfactory-role.enum';
import { MinFactoryUser } from '../../minfactory/models/domains/minfactory-user';
import { MinFactoryUserGuard } from '../../minfactory/guards/minfactory-user.guard';
import { MINFACTORY_USER_SERVICE_MOCK } from '../../minfactory/mocks/minfactory-user.service.mock';
import { MinFactoryUserService } from '../../minfactory/services/minfactory-user.service';
import { MinFactoryRolePolicy } from '../../minfactory/policies/minfactory-role.policy';
import { MINPOKER_GAME_SERVICE_MOCK } from '../mocks/minpoker-game.service.mock';
import { MinPokerCreateGameDto } from '../models/dtos/minpoker-create-game.dto';
import { MinPokerGameDto } from '../models/dtos/minpoker-game.dto';
import { MinPokerGameVisibility } from '../models/enums/minpoker-game-visibility.enum';
import { MinPokerGameService } from '../services/minpoker-game.service';
import { MinPokerGameController } from './minpoker-game.controller';

describe('MinPokerGameController', () => {
  let controller: MinPokerGameController;

  const mockGames: MinPokerGameDto[] = [
    {
      bigBlind: 2,
      createdAt: new Date('2026-03-24T18:45:30.000Z'),
      creatorId: '2f647dc3-2290-4a9e-839f-9792d0d711d1',
      id: '550e8400-e29b-41d4-a716-446655440000',
      visibility: MinPokerGameVisibility.Private,
      tableSize: 6,
      name: 'Evening Table',
      observerCount: 2,
      playerCount: 4,
      smallBlind: 1,
    },
    {
      bigBlind: 2,
      createdAt: new Date('2026-03-24T19:10:00.000Z'),
      creatorId: '744f9336-461b-4b87-a8f8-e6033b0fbfb0',
      id: '660e8400-e29b-41d4-a716-446655440000',
      visibility: MinPokerGameVisibility.Public,
      tableSize: 6,
      name: 'Turbo Sit and Go',
      observerCount: 1,
      playerCount: 3,
      smallBlind: 1,
    },
  ];

  beforeEach(() => {
    MINPOKER_GAME_SERVICE_MOCK.getAllGames.mockResolvedValue(mockGames);
    MINPOKER_GAME_SERVICE_MOCK.createGame.mockImplementation((dto: MinPokerCreateGameDto) =>
      Promise.resolve({
        ...mockGames[0],
        id: 'new-id',
        name: dto.name,
        createdAt: new Date(),
      }),
    );
    MINPOKER_GAME_SERVICE_MOCK.deleteGame.mockResolvedValue(undefined);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthorizationModule.forRoot({ globalGuard: false })],
      controllers: [MinPokerGameController],
      providers: [
        { provide: FirebaseGuard, useValue: AUTHENTICATION_GUARD_MOCK },
        { provide: AuthenticationService, useValue: AUTHENTICATION_SERVICE_MOCK },
        { provide: MinFactoryUserService, useValue: MINFACTORY_USER_SERVICE_MOCK },
        MinFactoryUserGuard,
        MinFactoryRolePolicy,
        { provide: MinPokerGameService, useValue: MINPOKER_GAME_SERVICE_MOCK },
      ],
    }).compile();

    controller = module.get<MinPokerGameController>(MinPokerGameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll()', () => {
    it('should return own games when no visibility parameter is given', async () => {
      const fakeUser = Object.assign(new MinFactoryUser(), {
        firebaseUid: 'fb-1',
        email: 'u@e.com',
        id: 'user-1',
        role: MinFactoryRole.User,
      });
      const result = await controller.getAll(fakeUser, 'test-request-id', undefined as any);

      expect(result).toHaveLength(2);
      expect(MINPOKER_GAME_SERVICE_MOCK.getAllGames).toHaveBeenCalledWith(fakeUser, undefined, 'test-request-id');
    });

    it('should return public games when visibility=public', async () => {
      const fakeUser = Object.assign(new MinFactoryUser(), {
        firebaseUid: 'fb-1',
        email: 'u@e.com',
        id: 'user-1',
        role: MinFactoryRole.User,
      });
      const result = await controller.getAll(fakeUser, 'test-request-id', MinPokerGameVisibility.Public);

      expect(result).toHaveLength(2);
      expect(MINPOKER_GAME_SERVICE_MOCK.getAllGames).toHaveBeenCalledWith(fakeUser, MinPokerGameVisibility.Public, 'test-request-id');
    });
  });

  describe('create()', () => {
    it('should create a new game via service and return dto', async () => {
      const dto: MinPokerCreateGameDto = { name: 'New Table', visibility: MinPokerGameVisibility.Public };

      const fakeUser = Object.assign(new MinFactoryUser(), {
        firebaseUid: 'fb-1',
        email: 'u@e.com',
        id: 'user-1',
        role: MinFactoryRole.User,
      });
      const result = await controller.create(dto, fakeUser, 'test-request-id');

      expect(result).toMatchObject({ name: 'New Table', id: 'new-id' });
      expect(MINPOKER_GAME_SERVICE_MOCK.createGame).toHaveBeenCalledWith(dto, fakeUser, 'test-request-id');
    });
  });

  describe('delete()', () => {
    it('should call service.deleteGame and return void', async () => {
      const fakeUser = Object.assign(new MinFactoryUser(), {
        firebaseUid: 'fb-1',
        email: 'u@e.com',
        id: 'user-1',
        role: MinFactoryRole.User,
      });
      const id = '550e8400-e29b-41d4-a716-446655440000';

      const result = await controller.delete(fakeUser, 'test-request-id', id);

      expect(result).toBeUndefined();
      expect(MINPOKER_GAME_SERVICE_MOCK.deleteGame).toHaveBeenCalledWith(id, fakeUser, 'test-request-id');
    });
  });
});
