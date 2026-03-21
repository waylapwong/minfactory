import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MinFactoryApiService, MinFactoryUserDto } from '../../../core/generated';
import { MINFACTORY_API_SERVICE_MOCK } from './minfactory-api.service.mock';
import { MinFactoryUserRepository } from './minfactory-user.repository';

describe('MinFactoryUserRepository', () => {
  let repository: MinFactoryUserRepository;

  beforeEach(() => {
    MINFACTORY_API_SERVICE_MOCK.createMinFactoryUser.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinFactoryUserRepository,
        { provide: MinFactoryApiService, useValue: MINFACTORY_API_SERVICE_MOCK },
      ],
    });

    repository = TestBed.inject(MinFactoryUserRepository);
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  describe('create()', () => {
    it('should create a minfactory user via API service', async () => {
      const userDto: MinFactoryUserDto = {
        createdAt: '2026-03-19T10:00:00.000Z',
        email: 'user@example.com',
      };
      MINFACTORY_API_SERVICE_MOCK.createMinFactoryUser.and.returnValue(of(userDto) as any);

      const result = await repository.create();

      expect(result).toEqual(userDto);
      expect(MINFACTORY_API_SERVICE_MOCK.createMinFactoryUser).toHaveBeenCalled();
    });
  });
});
