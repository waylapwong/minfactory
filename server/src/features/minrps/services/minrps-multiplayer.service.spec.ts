import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsMultiplayerService } from './minrps-multiplayer.service';

describe('MinRpsMultiplayerService', () => {
  let service: MinRpsMultiplayerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinRpsMultiplayerService],
    }).compile();

    service = module.get<MinRpsMultiplayerService>(MinRpsMultiplayerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
