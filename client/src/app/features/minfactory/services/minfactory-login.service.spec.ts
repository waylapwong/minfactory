import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../../core/services/auth.service';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';
import { MinFactoryLoginService } from './minfactory-login.service';

describe('MinFactoryLoginService', () => {
  let service: MinFactoryLoginService;
  let authServiceMock: {
    loginWithEmailAndPassword: jasmine.Spy;
  };
  let userRepositoryMock: jasmine.SpyObj<MinFactoryUserRepository>;

  beforeEach(() => {
    authServiceMock = {
      loginWithEmailAndPassword: jasmine
        .createSpy('loginWithEmailAndPassword')
        .and.returnValue(Promise.resolve()),
    };
    userRepositoryMock = jasmine.createSpyObj('MinFactoryUserRepository', ['getMe']);

    userRepositoryMock.getMe.and.returnValue(
      Promise.resolve({
        createdAt: '2026-03-19T10:00:00.000Z',
        email: 'user@example.com',
        id: 'minfactory-user-id',
      }),
    );

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinFactoryLoginService,
        { provide: AuthService, useValue: authServiceMock as unknown as AuthService },
        { provide: MinFactoryUserRepository, useValue: userRepositoryMock },
      ],
    });

    service = TestBed.inject(MinFactoryLoginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loginUser()', () => {
    it('should login with firebase and then fetch minfactory user', async () => {
      const result = await service.loginUser('user@example.com', 'password123');

      expect(authServiceMock.loginWithEmailAndPassword).toHaveBeenCalledWith('user@example.com', 'password123');
      expect(userRepositoryMock.getMe).toHaveBeenCalled();
      expect(result.id).toBe('minfactory-user-id');
      expect(result.email).toBe('user@example.com');
      expect(result.createdAt).toEqual(new Date('2026-03-19T10:00:00.000Z'));
    });

    it('should not fetch minfactory user when firebase login fails', async () => {
      authServiceMock.loginWithEmailAndPassword.and.returnValue(
        Promise.reject(new Error('Ungültige Anmeldedaten.')),
      );

      await expectAsync(service.loginUser('user@example.com', 'wrongpassword')).toBeRejectedWithError(
        'Ungültige Anmeldedaten.',
      );
      expect(userRepositoryMock.getMe).not.toHaveBeenCalled();
    });

    it('should throw error when fetching user fails', async () => {
      userRepositoryMock.getMe.and.returnValue(Promise.reject(new Error('Benutzer nicht gefunden.')));

      await expectAsync(service.loginUser('user@example.com', 'password123')).toBeRejectedWithError(
        'Benutzer nicht gefunden.',
      );
    });
  });
});
