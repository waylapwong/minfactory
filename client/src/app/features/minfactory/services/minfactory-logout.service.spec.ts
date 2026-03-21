import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from '../../../core/authentication/authentication.service';
import { MinFactoryLogoutService } from './minfactory-logout.service';

describe('MinFactoryLogoutService', () => {
  let service: MinFactoryLogoutService;
  let authServiceMock: {
    signOut: jasmine.Spy;
  };

  beforeEach(() => {
    authServiceMock = {
      signOut: jasmine.createSpy('signOut').and.returnValue(Promise.resolve()),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinFactoryLogoutService,
        { provide: AuthenticationService, useValue: authServiceMock as unknown as AuthenticationService },
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

      expect(authServiceMock.signOut).toHaveBeenCalled();
    });

    it('should throw error when firebase sign out fails', async () => {
      authServiceMock.signOut.and.returnValue(Promise.reject(new Error('Sign out failed.')));

      await expectAsync(service.logoutUser()).toBeRejectedWithError('Sign out failed.');
    });
  });
});
