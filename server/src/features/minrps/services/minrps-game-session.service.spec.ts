import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsGameSessionService } from './minrps-game-session.service';

describe('MinRpsGameSessionService', () => {
  let service: MinRpsGameSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinRpsGameSessionService],
    }).compile();

    service = module.get<MinRpsGameSessionService>(MinRpsGameSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
