import { Test, TestingModule } from '@nestjs/testing';
import { MinFactoryController } from './minfactory.controller';
import { APP_VERSION } from 'src/core/settings/app-version.settings';

describe('MinFactoryController', () => {
  let controller: MinFactoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinFactoryController],
    }).compile();

    controller = module.get<MinFactoryController>(MinFactoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = controller.getHealth();

      expect(result).toBe('minFactory up and running!');
    });
  });

  describe('getVersion', () => {
    it('should return minFactory version', () => {
      const result = controller.getVersion();

      expect(result).toBe(APP_VERSION.MIN_FACTORY);
    });
  });
});
