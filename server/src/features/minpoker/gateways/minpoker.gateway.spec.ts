import { Test, TestingModule } from '@nestjs/testing';
import { MinPokerGateway } from './minpoker.gateway';

describe('MinpokerGateway', () => {
  let gateway: MinPokerGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinPokerGateway],
    }).compile();

    gateway = module.get<MinPokerGateway>(MinPokerGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
