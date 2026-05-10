import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationGuard } from '../../../core/authentication/guards/authentication.guard';
import { AUTHENTICATION_GUARD_MOCK } from '../../../core/authentication/mocks/authentication.guard.mock';
import { AUTHENTICATION_SERVICE_MOCK } from '../../../core/authentication/mocks/authentication.service.mock';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
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
      isPublic: false,
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
      isPublic: true,
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
      controllers: [MinPokerGameController],
      providers: [
        { provide: AuthenticationGuard, useValue: AUTHENTICATION_GUARD_MOCK },
        { provide: AuthenticationService, useValue: AUTHENTICATION_SERVICE_MOCK },
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
      const fakeUser = { firebaseUid: 'fb-1', email: 'u@e.com' } as any;
      const result = await controller.getAll(fakeUser, 'test-request-id', undefined as any);

      expect(result).toHaveLength(2);
      expect(MINPOKER_GAME_SERVICE_MOCK.getAllGames).toHaveBeenCalledWith(fakeUser, undefined, 'test-request-id');
    });

    it('should return public games when visibility=public', async () => {
      const fakeUser = { firebaseUid: 'fb-1', email: 'u@e.com' } as any;
      const result = await controller.getAll(fakeUser, 'test-request-id', MinPokerGameVisibility.Public);

      expect(result).toHaveLength(2);
      expect(MINPOKER_GAME_SERVICE_MOCK.getAllGames).toHaveBeenCalledWith(fakeUser, MinPokerGameVisibility.Public, 'test-request-id');
    });
  });

  describe('create()', () => {
    it('should create a new game via service and return dto', async () => {
      const dto: MinPokerCreateGameDto = { name: 'New Table', isPublic: true } as MinPokerCreateGameDto;

      const fakeUser = { firebaseUid: 'fb-1', email: 'u@e.com' } as any;
      const result = await controller.create(dto, fakeUser, 'test-request-id');

      expect(result).toMatchObject({ name: 'New Table', id: 'new-id' });
      expect(MINPOKER_GAME_SERVICE_MOCK.createGame).toHaveBeenCalledWith(dto, fakeUser, 'test-request-id');
    });
  });

  describe('delete()', () => {
    it('should call service.deleteGame and return void', async () => {
      const fakeUser = { firebaseUid: 'fb-1', email: 'u@e.com' } as any;
      const id = '550e8400-e29b-41d4-a716-446655440000';

      const result = await controller.delete(id, fakeUser, 'test-request-id');

      expect(result).toBeUndefined();
      expect(MINPOKER_GAME_SERVICE_MOCK.deleteGame).toHaveBeenCalledWith(id, fakeUser, 'test-request-id');
    });
  });
});
