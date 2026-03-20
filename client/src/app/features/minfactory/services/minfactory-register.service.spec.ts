import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../../core/services/auth.service';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';
import { MinFactoryRegisterService } from './minfactory-register.service';

describe('MinFactoryRegisterService', () => {
  let service: MinFactoryRegisterService;
  let authServiceMock: {
    currentUser: jasmine.Spy;
    getIdToken: jasmine.Spy;
    registerWithEmailAndPassword: jasmine.Spy;
  };
  let userRepositoryMock: jasmine.SpyObj<MinFactoryUserRepository>;

  beforeEach(() => {
    authServiceMock = {
      currentUser: jasmine.createSpy('currentUser').and.returnValue({ email: 'user@example.com' }),
      getIdToken: jasmine.createSpy('getIdToken').and.returnValue(Promise.resolve('firebase-token')),
      registerWithEmailAndPassword: jasmine
        .createSpy('registerWithEmailAndPassword')
        .and.returnValue(Promise.resolve()),
    };
    userRepositoryMock = jasmine.createSpyObj('MinFactoryUserRepository', ['createUser']);

    userRepositoryMock.createUser.and.returnValue(
      Promise.resolve({
        createdAt: '2026-03-19T10:00:00.000Z',
        email: 'user@example.com',
      }),
    );

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinFactoryRegisterService,
        { provide: AuthService, useValue: authServiceMock as unknown as AuthService },
        { provide: MinFactoryUserRepository, useValue: userRepositoryMock },
      ],
    });

    service = TestBed.inject(MinFactoryRegisterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('registerUser()', () => {
    it('should register with firebase and then create minfactory user', async () => {
      const result = await service.registerUser('user@example.com', 'password123');

      expect(authServiceMock.registerWithEmailAndPassword).toHaveBeenCalledWith('user@example.com', 'password123');
      expect(authServiceMock.getIdToken).toHaveBeenCalledWith(true);
      expect(userRepositoryMock.createUser).toHaveBeenCalled();
      expect(result.email).toBe('user@example.com');
      expect(result.createdAt).toEqual(new Date('2026-03-19T10:00:00.000Z'));
    });

    it('should continue registration when firebase email already exists but current user matches', async () => {
      authServiceMock.registerWithEmailAndPassword.and.returnValue(
        Promise.reject(new Error('Diese E-Mail-Adresse wird bereits verwendet.')),
      );

      const result = await service.registerUser('user@example.com', 'password123');

      expect(authServiceMock.currentUser).toHaveBeenCalled();
      expect(authServiceMock.getIdToken).toHaveBeenCalledWith(true);
      expect(userRepositoryMock.createUser).toHaveBeenCalled();
      expect(result.email).toBe('user@example.com');
    });

    it('should not create minfactory user when firebase registration fails', async () => {
      authServiceMock.registerWithEmailAndPassword.and.returnValue(Promise.reject(new Error('firebase failed')));

      await expectAsync(service.registerUser('user@example.com', 'password123')).toBeRejectedWithError(
        'firebase failed',
      );
      expect(userRepositoryMock.createUser).not.toHaveBeenCalled();
    });

    it('should fail fast when no id token is available after registration', async () => {
      authServiceMock.getIdToken.and.returnValue(Promise.resolve(null));

      await expectAsync(service.registerUser('user@example.com', 'password123')).toBeRejectedWithError(
        'Konto erstellt, aber keine gueltige Session vorhanden. Bitte erneut versuchen.',
      );
      expect(userRepositoryMock.createUser).not.toHaveBeenCalled();
    });

    it('should not continue email-already-in-use flow when current user does not match', async () => {
      authServiceMock.currentUser.and.returnValue({ email: 'other@example.com' });
      authServiceMock.registerWithEmailAndPassword.and.returnValue(
        Promise.reject(new Error('Diese E-Mail-Adresse wird bereits verwendet.')),
      );

      await expectAsync(service.registerUser('user@example.com', 'password123')).toBeRejectedWithError(
        'Diese E-Mail-Adresse wird bereits verwendet.',
      );
      expect(userRepositoryMock.createUser).not.toHaveBeenCalled();
    });
  });
});
