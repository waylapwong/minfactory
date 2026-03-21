import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';
import { MINFACTORY_USER_REPOSITORY_MOCK } from '../repositories/minfactory-user.repository.mock';
import { MinFactoryProfileService } from './minfactory-profile.service';

describe('MinFactoryProfileService', () => {
  let service: MinFactoryProfileService;

  beforeEach(() => {
    MINFACTORY_USER_REPOSITORY_MOCK.getMe.calls.reset();
    MINFACTORY_USER_REPOSITORY_MOCK.getMe.and.callFake(async () => ({
      createdAt: '2026-03-19T10:00:00.000Z',
      email: 'user@example.com',
    }));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinFactoryProfileService,
        { provide: MinFactoryUserRepository, useValue: MINFACTORY_USER_REPOSITORY_MOCK },
      ],
    });

    service = TestBed.inject(MinFactoryProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadProfile()', () => {
    it('should map repository dto to profile viewmodel', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.getMe.and.returnValue(
        Promise.resolve({
          createdAt: '2026-03-19T10:00:00.000Z',
          email: 'user@example.com',
        }),
      );

      const result = await service.loadProfile();

      expect(MINFACTORY_USER_REPOSITORY_MOCK.getMe).toHaveBeenCalled();
      expect(result.email).toBe('user@example.com');
      expect(result.createdAt.length).toBeGreaterThan(0);
    });

    it('should throw error when repository fails', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.getMe.and.returnValue(Promise.reject(new Error('Unauthorized')));

      await expectAsync(service.loadProfile()).toBeRejectedWithError('Unauthorized');
    });
  });
});
