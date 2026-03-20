import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MinFactoryApiService, MinFactoryUserDto } from '../../../core/generated';
import { MinFactoryUserRepository } from './minfactory-user.repository';

describe('MinFactoryUserRepository', () => {
  let repository: MinFactoryUserRepository;
  let mockApiService: jasmine.SpyObj<MinFactoryApiService>;

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj('MinFactoryApiService', ['createMinFactoryUser']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinFactoryUserRepository,
        { provide: MinFactoryApiService, useValue: mockApiService },
      ],
    });

    repository = TestBed.inject(MinFactoryUserRepository);
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  describe('createUser()', () => {
    it('should create a minfactory user via API service', async () => {
      const userDto: MinFactoryUserDto = {
        createdAt: '2026-03-19T10:00:00.000Z',
        email: 'user@example.com',
      };
      mockApiService.createMinFactoryUser.and.returnValue(of(userDto) as any);

      const result = await repository.createUser();

      expect(result).toEqual(userDto);
      expect(mockApiService.createMinFactoryUser).toHaveBeenCalled();
    });
  });
});
