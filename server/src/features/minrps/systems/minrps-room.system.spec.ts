import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsRoomSystem } from './minrps-room.system';

describe('MinRpsRoomSystem', () => {
  let service: MinRpsRoomSystem;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinRpsRoomSystem],
    }).compile();

    service = module.get<MinRpsRoomSystem>(MinRpsRoomSystem);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
