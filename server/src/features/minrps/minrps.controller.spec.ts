import { MinRpsController } from './minrps.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { APP_VERSION } from 'src/core/settings/app-version.settings';

describe('MinRpsController', () => {
  let controller: MinRpsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinRpsController],
    }).compile();

    controller = module.get<MinRpsController>(MinRpsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = controller.getHealth();

      expect(result).toBe('minRPS up and running!');
    });
  });

  describe('getVersion', () => {
    it('should return minRPS version', () => {
      const result = controller.getVersion();

      expect(result).toBe(APP_VERSION.MIN_RPS);
    });
  });
});
