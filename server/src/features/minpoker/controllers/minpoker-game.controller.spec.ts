import { Test, TestingModule } from '@nestjs/testing';
import { MinPokerGameController } from './minpoker-game.controller';
import { AuthenticationGuard } from 'src/core/authentication/guards/authentication.guard';
import { AuthenticationService } from 'src/core/authentication/services/authentication.service';
import { AUTHENTICATION_GUARD_MOCK } from 'src/core/mocks/authentication.guard.mock';
import { AUTHENTICATION_SERVICE_MOCK } from 'src/core/mocks/authentication.service.mock';
import { MinPokerGameService } from 'src/features/minpoker/services/minpoker-game.service';
import { MinPokerCreateGameDto } from '../models/dtos/minpoker-create-game.dto';

describe('MinPokerGameController', () => {
  let controller: MinPokerGameController;

  const mockGames = [
    {
      bigBlind: 2,
      createdAt: new Date('2026-03-24T18:45:30.000Z'),
      id: '550e8400-e29b-41d4-a716-446655440000',
      maxPlayerCount: 6,
      name: 'Evening Table',
      observerCount: 2,
      playerCount: 4,
      smallBlind: 1,
    },
    {
      bigBlind: 2,
      createdAt: new Date('2026-03-24T19:10:00.000Z'),
      id: '660e8400-e29b-41d4-a716-446655440000',
      maxPlayerCount: 6,
      name: 'Turbo Sit and Go',
      observerCount: 1,
      playerCount: 3,
      smallBlind: 1,
    },
  ];

  const MINPOKER_GAME_SERVICE_MOCK = {
    getAllGames: jest.fn().mockResolvedValue(mockGames),
    createGame: jest.fn().mockImplementation((dto: MinPokerCreateGameDto) =>
      Promise.resolve({
        ...mockGames[0],
        id: 'new-id',
        name: dto.name,
        createdAt: new Date(),
      }),
    ),
  };

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
    it('should return mock game dtos', async () => {
      const result = await controller.getAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        bigBlind: 2,
        id: '550e8400-e29b-41d4-a716-446655440000',
        maxPlayerCount: 6,
        name: 'Evening Table',
        observerCount: 2,
        playerCount: 4,
        smallBlind: 1,
      });
      expect(MINPOKER_GAME_SERVICE_MOCK.getAllGames).toHaveBeenCalled();
    });
  });

  describe('create()', () => {
    it('should create a new game via service and return dto', async () => {
      const dto: MinPokerCreateGameDto = { name: 'New Table' } as MinPokerCreateGameDto;

      const result = await controller.create(dto);

      expect(result).toMatchObject({ name: 'New Table', id: 'new-id' });
      expect(MINPOKER_GAME_SERVICE_MOCK.createGame).toHaveBeenCalledWith(dto);
    });
  });
});
