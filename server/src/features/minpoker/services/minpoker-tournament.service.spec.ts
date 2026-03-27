import { Test, TestingModule } from '@nestjs/testing';
import { MinPokerTournamentService } from './minpoker-tournament.service';

describe('MinpokerTournamentService', () => {
  let service: MinPokerTournamentService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinPokerTournamentService],
    }).compile();

    service = module.get<MinPokerTournamentService>(MinPokerTournamentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should return connected event with provided player id', () => {
      const result = service.handleConnection('user-1');

      expect(result.playerId).toBe('user-1');
    });
  });

  describe('handleDisconnect', () => {
    it('should return disconnected event with provided player id', () => {
      const result = service.handleDisconnect('user-2');

      expect(result.playerId).toBe('user-2');
    });
  });
});
