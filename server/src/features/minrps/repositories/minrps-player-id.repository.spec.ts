import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsPlayerIdRepository } from './minrps-player-id.repository';

describe('MinRpsPlayerIdRepository', () => {
  let service: MinRpsPlayerIdRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinRpsPlayerIdRepository],
    }).compile();

    service = module.get<MinRpsPlayerIdRepository>(MinRpsPlayerIdRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('save()', () => {
    it('should save a socket-to-player mapping', () => {
      service.save('socket-1', 'player-1');

      expect(service.findOne('socket-1')).toBe('player-1');
    });
  });

  describe('findOne()', () => {
    it('should return the player id for a known socket id', () => {
      service.save('socket-1', 'player-abc');

      const result = service.findOne('socket-1');

      expect(result).toBe('player-abc');
    });

    it('should return null for an unknown socket id', () => {
      const result = service.findOne('non-existent-socket');

      expect(result).toBeNull();
    });
  });

  describe('delete()', () => {
    it('should remove the socket-to-player mapping', () => {
      service.save('socket-1', 'player-1');
      service.delete('socket-1');

      expect(service.findOne('socket-1')).toBeNull();
    });

    it('should not throw when deleting a non-existent socket id', () => {
      expect(() => service.delete('non-existent-socket')).not.toThrow();
    });
  });
});

