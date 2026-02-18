import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MinRPSApiService, MinRpsGameDto } from '../../../core/generated';
import { MinRpsGameRepository } from './minrps-game.repository';

describe('MinRpsGameRepository', () => {
  let repository: MinRpsGameRepository;
  let mockApiService: jasmine.SpyObj<MinRPSApiService>;

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj('MinRPSApiService', [
      'createMinRpsGame',
      'deleteMinRpsGame',
      'getMinRpsGame',
      'getAllMinRpsGames',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinRpsGameRepository,
        { provide: MinRPSApiService, useValue: mockApiService },
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
      mockApiService.createMinRpsGame.and.returnValue(of(mockDto) as any);

      const result = await repository.create('Test Game');

      expect(result).toEqual(mockDto);
      expect(mockApiService.createMinRpsGame).toHaveBeenCalledWith({ name: 'Test Game' });
    });
  });

  describe('delete()', () => {
    it('should delete a game via API service', async () => {
      mockApiService.deleteMinRpsGame.and.returnValue(of(undefined) as any);

      await repository.delete('test-id');

      expect(mockApiService.deleteMinRpsGame).toHaveBeenCalledWith('test-id');
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
      mockApiService.getMinRpsGame.and.returnValue(of(mockDto) as any);

      const result = await repository.get('test-id');

      expect(result).toEqual(mockDto);
      expect(mockApiService.getMinRpsGame).toHaveBeenCalledWith('test-id');
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
      mockApiService.getAllMinRpsGames.and.returnValue(of(mockDtos) as any);

      const result = await repository.getAll();

      expect(result).toEqual(mockDtos);
      expect(mockApiService.getAllMinRpsGames).toHaveBeenCalled();
    });
  });
});
