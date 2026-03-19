import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../../core/services/auth.service';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';
import { MinFactoryRegisterService } from './minfactory-register.service';

describe('MinFactoryRegisterService', () => {
  let service: MinFactoryRegisterService;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let userRepositoryMock: jasmine.SpyObj<MinFactoryUserRepository>;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['registerWithEmailAndPassword']);
    userRepositoryMock = jasmine.createSpyObj('MinFactoryUserRepository', ['createUser']);

    authServiceMock.registerWithEmailAndPassword.and.returnValue(Promise.resolve());
    userRepositoryMock.createUser.and.returnValue(
      Promise.resolve({
        createdAt: '2026-03-19T10:00:00.000Z',
        email: 'user@example.com',
        id: 'minfactory-user-id',
      }),
    );

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinFactoryRegisterService,
        { provide: AuthService, useValue: authServiceMock },
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
      expect(userRepositoryMock.createUser).toHaveBeenCalled();
      expect(result.id).toBe('minfactory-user-id');
      expect(result.email).toBe('user@example.com');
      expect(result.createdAt).toEqual(new Date('2026-03-19T10:00:00.000Z'));
    });

    it('should not create minfactory user when firebase registration fails', async () => {
      authServiceMock.registerWithEmailAndPassword.and.returnValue(Promise.reject(new Error('firebase failed')));

      await expectAsync(service.registerUser('user@example.com', 'password123')).toBeRejectedWithError(
        'firebase failed',
      );
      expect(userRepositoryMock.createUser).not.toHaveBeenCalled();
    });
  });
});
