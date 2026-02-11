import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsSingleplayerService } from './minrps-singleplayer.service';

describe('MinRpsSingleplayerService', () => {
  let service: MinRpsSingleplayerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinRpsSingleplayerService],
    }).compile();

    service = module.get<MinRpsSingleplayerService>(MinRpsSingleplayerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
