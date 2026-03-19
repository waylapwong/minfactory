import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';
import { MinFactoryProfileService } from './minfactory-profile.service';

describe('MinFactoryProfileService', () => {
  let service: MinFactoryProfileService;
  let userRepositoryMock: jasmine.SpyObj<MinFactoryUserRepository>;

  beforeEach(() => {
    userRepositoryMock = jasmine.createSpyObj('MinFactoryUserRepository', ['getMe']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinFactoryProfileService,
        { provide: MinFactoryUserRepository, useValue: userRepositoryMock },
      ],
    });

    service = TestBed.inject(MinFactoryProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadProfile()', () => {
    it('should map repository dto to profile viewmodel', async () => {
      userRepositoryMock.getMe.and.returnValue(
        Promise.resolve({
          createdAt: '2026-03-19T10:00:00.000Z',
          email: 'user@example.com',
          id: 'minfactory-user-id',
        }),
      );

      const result = await service.loadProfile();

      expect(userRepositoryMock.getMe).toHaveBeenCalled();
      expect(result.email).toBe('user@example.com');
      expect(result.id).toBe('minfactory-user-id');
      expect(result.createdAt.length).toBeGreaterThan(0);
    });

    it('should throw error when repository fails', async () => {
      userRepositoryMock.getMe.and.returnValue(Promise.reject(new Error('Unauthorized')));

      await expectAsync(service.loadProfile()).toBeRejectedWithError('Unauthorized');
    });
  });
});
