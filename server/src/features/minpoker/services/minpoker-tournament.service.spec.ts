import { Test, TestingModule } from '@nestjs/testing';
import { MINFACTORY_USER_REPOSITORY_MOCK } from 'src/features/minfactory/mocks/minfactory-user.repository.mock';
import { MinFactoryUserRepository } from 'src/features/minfactory/repositories/minfactory-user.repository';
import { MinPokerTournamentService } from './minpoker-tournament.service';

describe('MinpokerTournamentService', () => {
  let service: MinPokerTournamentService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinPokerTournamentService,
        {
          provide: MinFactoryUserRepository,
          useValue: MINFACTORY_USER_REPOSITORY_MOCK,
        },
      ],
    }).compile();

    service = module.get<MinPokerTournamentService>(MinPokerTournamentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should return connected event with authenticated user id', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue({
        id: 'user-1',
      });

      const result = await service.handleConnection('firebase-uid-1');

      expect(MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid).toHaveBeenCalledWith('firebase-uid-1');
      expect(result.playerId).toBe('user-1');
    });
  });

  describe('handleDisconnect', () => {
    it('should return disconnected event with authenticated user id', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue({
        id: 'user-2',
      });

      const result = await service.handleDisconnect('firebase-uid-2');

      expect(MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid).toHaveBeenCalledWith('firebase-uid-2');
      expect(result.playerId).toBe('user-2');
    });
  });
});
