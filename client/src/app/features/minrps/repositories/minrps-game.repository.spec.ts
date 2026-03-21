import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MinRPSApiService, MinRpsGameDto } from '../../../core/generated';
import { MINRPS_API_SERVICE_MOCK } from '../mocks/minrps-api.service.mock';
import { MinRpsGameRepository } from './minrps-game.repository';

describe('MinRpsGameRepository', () => {
  let repository: MinRpsGameRepository;

  beforeEach(() => {
    MINRPS_API_SERVICE_MOCK.createMinRpsGame.calls.reset();
    MINRPS_API_SERVICE_MOCK.deleteMinRpsGame.calls.reset();
    MINRPS_API_SERVICE_MOCK.getMinRpsGame.calls.reset();
    MINRPS_API_SERVICE_MOCK.getAllMinRpsGames.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinRpsGameRepository,
        { provide: MinRPSApiService, useValue: MINRPS_API_SERVICE_MOCK },
      ],
    });
    repository = TestBed.inject(MinRpsGameRepository);
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  describe('create()', () => {
    it('should create a game via API service', async () => {
      const mockDto: MinRpsGameDto = {
        id: 'test-id',
        name: 'Test Game',
        createdAt: new Date().toISOString(),
        observerCount: 0,
        playerCount: 0,
      };
      MINRPS_API_SERVICE_MOCK.createMinRpsGame.and.returnValue(of(mockDto) as any);

      const result = await repository.create('Test Game');

      expect(result).toEqual(mockDto);
      expect(MINRPS_API_SERVICE_MOCK.createMinRpsGame).toHaveBeenCalledWith({ name: 'Test Game' });
    });
  });

  describe('delete()', () => {
    it('should delete a game via API service', async () => {
      MINRPS_API_SERVICE_MOCK.deleteMinRpsGame.and.returnValue(of(undefined) as any);

      await repository.delete('test-id');

      expect(MINRPS_API_SERVICE_MOCK.deleteMinRpsGame).toHaveBeenCalledWith('test-id');
    });
  });

  describe('get()', () => {
    it('should get a game by id via API service', async () => {
      const mockDto: MinRpsGameDto = {
        id: 'test-id',
        name: 'Test Game',
        createdAt: new Date().toISOString(),
        observerCount: 0,
        playerCount: 0,
      };
      MINRPS_API_SERVICE_MOCK.getMinRpsGame.and.returnValue(of(mockDto) as any);

      const result = await repository.get('test-id');

      expect(result).toEqual(mockDto);
      expect(MINRPS_API_SERVICE_MOCK.getMinRpsGame).toHaveBeenCalledWith('test-id');
    });
  });

  describe('getAll()', () => {
    it('should get all games via API service', async () => {
      const mockDtos: MinRpsGameDto[] = [
        {
          id: 'id-1',
          name: 'Game 1',
          createdAt: new Date().toISOString(),
          observerCount: 0,
          playerCount: 0,
        },
        {
          id: 'id-2',
          name: 'Game 2',
          createdAt: new Date().toISOString(),
          observerCount: 1,
          playerCount: 2,
        },
      ];
      MINRPS_API_SERVICE_MOCK.getAllMinRpsGames.and.returnValue(of(mockDtos) as any);

      const result = await repository.getAll();

      expect(result).toEqual(mockDtos);
      expect(MINRPS_API_SERVICE_MOCK.getAllMinRpsGames).toHaveBeenCalled();
    });
  });
});
