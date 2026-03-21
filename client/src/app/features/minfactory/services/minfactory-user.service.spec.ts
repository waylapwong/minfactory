import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';
import { MINFACTORY_USER_REPOSITORY_MOCK } from '../repositories/minfactory-user.repository.mock';
import { MinFactoryUserService } from './minfactory-user.service';

describe('MinFactoryUserService', () => {
  let service: MinFactoryUserService;

  beforeEach(() => {
    MINFACTORY_USER_REPOSITORY_MOCK.get.calls.reset();
    MINFACTORY_USER_REPOSITORY_MOCK.get.and.callFake(async () => ({
      createdAt: '2026-03-19T10:00:00.000Z',
      email: 'user@example.com',
    }));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinFactoryUserService,
        { provide: MinFactoryUserRepository, useValue: MINFACTORY_USER_REPOSITORY_MOCK },
      ],
    });

    service = TestBed.inject(MinFactoryUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose null profile initially', () => {
    expect(service.profile()).toBeNull();
  });

  describe('loadProfile()', () => {
    it('should map repository dto to cached profile viewmodel', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.get.and.returnValue(
        Promise.resolve({
          createdAt: '2026-03-19T10:00:00.000Z',
          email: 'user@example.com',
        }),
      );

      await service.loadProfile();

      expect(MINFACTORY_USER_REPOSITORY_MOCK.get).toHaveBeenCalled();
      expect(service.profile()?.email).toBe('user@example.com');
      expect((service.profile()?.createdAt ?? '').length).toBeGreaterThan(0);
    });

    it('should throw error when repository fails', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.get.and.returnValue(Promise.reject(new Error('Unauthorized')));

      await expectAsync(service.loadProfile()).toBeRejectedWithError('Unauthorized');
    });
  });

  describe('clearProfileCache()', () => {
    it('should reset cached profile to null', async () => {
      await service.loadProfile();

      service.clearProfileCache();

      expect(service.profile()).toBeNull();
    });
  });
});
