import { Test, TestingModule } from '@nestjs/testing';
import { MinPokerGameController } from './minpoker-game.controller';
import { AuthenticationGuard } from 'src/core/authentication/guards/authentication.guard';
import { AUTHENTICATION_GUARD_MOCK } from 'src/core/mocks/authentication.guard.mock';
import { AuthenticationService } from 'src/core/authentication/services/authentication.service';
import { AUTHENTICATION_SERVICE_MOCK } from 'src/core/mocks/authentication.service.mock';

describe('MinPokerGameController', () => {
  let controller: MinPokerGameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinPokerGameController],
      providers: [
        { provide: AuthenticationGuard, useValue: AUTHENTICATION_GUARD_MOCK },
        { provide: AuthenticationService, useValue: AUTHENTICATION_SERVICE_MOCK },
      ],
    }).compile();

    controller = module.get<MinPokerGameController>(MinPokerGameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return mock game dtos', () => {
      const result = controller.getAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        bigBlind: 100,
        id: '550e8400-e29b-41d4-a716-446655440000',
        maxPlayerCount: 9,
        name: 'Evening Table',
        observerCount: 2,
        playerCount: 4,
        smallBlind: 50,
      });
    });
  });
});
