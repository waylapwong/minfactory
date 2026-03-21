import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from '../../../core/authentication/authentication.service';
import { MINFACTORY_AUTHENTICATION_SERVICE_MOCK } from './minfactory-authentication.service.mock';
import { MinFactoryLogoutService } from './minfactory-logout.service';

describe('MinFactoryLogoutService', () => {
  let service: MinFactoryLogoutService;

  beforeEach(() => {
    MINFACTORY_AUTHENTICATION_SERVICE_MOCK.signOut.calls.reset();
    MINFACTORY_AUTHENTICATION_SERVICE_MOCK.signOut.and.resolveTo();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinFactoryLogoutService,
        { provide: AuthenticationService, useValue: MINFACTORY_AUTHENTICATION_SERVICE_MOCK },
      ],
    });

    service = TestBed.inject(MinFactoryLogoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('logoutUser()', () => {
    it('should sign out via firebase', async () => {
      await service.logoutUser();

      expect(MINFACTORY_AUTHENTICATION_SERVICE_MOCK.signOut).toHaveBeenCalled();
    });

    it('should throw error when firebase sign out fails', async () => {
      MINFACTORY_AUTHENTICATION_SERVICE_MOCK.signOut.and.returnValue(Promise.reject(new Error('Sign out failed.')));

      await expectAsync(service.logoutUser()).toBeRejectedWithError('Sign out failed.');
    });
  });
});
