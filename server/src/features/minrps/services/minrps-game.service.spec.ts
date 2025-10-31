import { MinRpsGameService } from './minrps-game.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('MinRpsGameService', () => {
  let service: MinRpsGameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinRpsGameService],
    }).compile();

    service = module.get<MinRpsGameService>(MinRpsGameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
