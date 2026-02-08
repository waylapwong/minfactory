import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsMatchSystem } from './minrps-match.system';

describe('MinRpsMatchSystem', () => {
  let service: MinRpsMatchSystem;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinRpsMatchSystem],
    }).compile();

    service = module.get<MinRpsMatchSystem>(MinRpsMatchSystem);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
