import { Test, TestingModule } from '@nestjs/testing';
import { MinpokerTournamentService } from './minpoker-tournament.service';

describe('MinpokerTournamentService', () => {
  let service: MinpokerTournamentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinpokerTournamentService],
    }).compile();

    service = module.get<MinpokerTournamentService>(MinpokerTournamentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
