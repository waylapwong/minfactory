import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MinRpsGameDto } from '../../../core/generated';
import { MinRpsGameRepository } from '../repositories/minrps-game.repository';
import { MinRpsGameService } from './minrps-game.service';

describe('MinRpsGameService', () => {
  let service: MinRpsGameService;
  let mockRepository: jasmine.SpyObj<MinRpsGameRepository>;

  beforeEach(() => {
    mockRepository = jasmine.createSpyObj('MinRpsGameRepository', [
      'create',
      'delete',
      'get',
      'getAll',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinRpsGameService,
        { provide: MinRpsGameRepository, useValue: mockRepository },
      ],
    });
    service = TestBed.inject(MinRpsGameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createGame()', () => {
    it('should create a game and update cached games', async () => {
      const mockDto: MinRpsGameDto = {
        id: 'test-id',
        name: 'Test Game',
        createdAt: new Date().toISOString(),
        observerCount: 0,
        playerCount: 0,
      };
      mockRepository.create.and.returnValue(Promise.resolve(mockDto));

      await service.createGame('Test Game');

      expect(mockRepository.create).toHaveBeenCalledWith('Test Game');
      expect(service.games().length).toBe(1);
    });

    it('should sort games by creation date descending when adding multiple games', async () => {
      const mockDto1: MinRpsGameDto = {
        id: 'test-id-1',
        name: 'Test Game 1',
        createdAt: new Date('2024-01-01').toISOString(),
        observerCount: 0,
        playerCount: 0,
      };
      const mockDto2: MinRpsGameDto = {
        id: 'test-id-2',
        name: 'Test Game 2',
        createdAt: new Date('2024-01-02').toISOString(),
        observerCount: 0,
        playerCount: 0,
      };
      mockRepository.create.and.returnValues(Promise.resolve(mockDto1), Promise.resolve(mockDto2));

      await service.createGame('Test Game 1');
      await service.createGame('Test Game 2');

      const games = service.games();
      expect(games.length).toBe(2);
      expect(games[0].id).toBe('test-id-2');
      expect(games[1].id).toBe('test-id-1');
    });
  });

  describe('deleteGame()', () => {
    it('should delete a game and update cached games', async () => {
      const mockDto: MinRpsGameDto = {
        id: 'test-id',
        name: 'Test Game',
        createdAt: new Date().toISOString(),
        observerCount: 0,
        playerCount: 0,
      };
      mockRepository.create.and.returnValue(Promise.resolve(mockDto));
      mockRepository.delete.and.returnValue(Promise.resolve());

      await service.createGame('Test Game');
      await service.deleteGame('test-id');

      expect(mockRepository.delete).toHaveBeenCalledWith('test-id');
      expect(service.games().length).toBe(0);
    });

    it('should maintain sort order after deleting a game', async () => {
      const mockDto1: MinRpsGameDto = {
        id: 'test-id-1',
        name: 'Test Game 1',
        createdAt: new Date('2024-01-01').toISOString(),
        observerCount: 0,
        playerCount: 0,
      };
      const mockDto2: MinRpsGameDto = {
        id: 'test-id-2',
        name: 'Test Game 2',
        createdAt: new Date('2024-01-02').toISOString(),
        observerCount: 0,
        playerCount: 0,
      };
      const mockDto3: MinRpsGameDto = {
        id: 'test-id-3',
        name: 'Test Game 3',
        createdAt: new Date('2024-01-03').toISOString(),
        observerCount: 0,
        playerCount: 0,
      };
      mockRepository.create.and.returnValues(
        Promise.resolve(mockDto1),
        Promise.resolve(mockDto2),
        Promise.resolve(mockDto3),
      );
      mockRepository.delete.and.returnValue(Promise.resolve());

      await service.createGame('Test Game 1');
      await service.createGame('Test Game 2');
      await service.createGame('Test Game 3');
      await service.deleteGame('test-id-2');

      const games = service.games();
      expect(games.length).toBe(2);
      expect(games[0].id).toBe('test-id-3');
      expect(games[1].id).toBe('test-id-1');
    });
  });

  describe('gameExistByID()', () => {
    it('should return true if game exists', async () => {
      const mockDto: MinRpsGameDto = {
        id: 'test-id',
        name: 'Test Game',
        createdAt: new Date().toISOString(),
        observerCount: 0,
        playerCount: 0,
      };
      mockRepository.get.and.returnValue(Promise.resolve(mockDto));

      const exists = await service.gameExistByID('test-id');

      expect(exists).toBe(true);
    });

    it('should return false if game does not exist', async () => {
      mockRepository.get.and.returnValue(Promise.reject(new Error('Not found')));

      const exists = await service.gameExistByID('test-id');

      expect(exists).toBe(false);
    });
  });

  describe('refreshGames()', () => {
    it('should refresh games from repository', async () => {
      const mockDtos: MinRpsGameDto[] = [
        {
          id: 'test-id-1',
          name: 'Test Game 1',
          createdAt: new Date().toISOString(),
          observerCount: 0,
          playerCount: 0,
        },
        {
          id: 'test-id-2',
          name: 'Test Game 2',
          createdAt: new Date().toISOString(),
          observerCount: 0,
          playerCount: 0,
        },
      ];
      mockRepository.getAll.and.returnValue(Promise.resolve(mockDtos));

      await service.refreshGames();

      expect(mockRepository.getAll).toHaveBeenCalled();
      expect(service.games().length).toBe(2);
    });
  });
});
